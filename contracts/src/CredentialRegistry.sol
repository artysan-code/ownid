// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title CredentialRegistry
 * @notice Registry per credenziali verificabili con Merkle proofs
 * @dev Sostituisce PublicBadgeNetwork rimuovendo logica ERC721
 */
contract CredentialRegistry {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Strutture dati
    struct Issuer {
        string name;
        address wallet;
        bool active;
        uint256 addedAt;
    }

    struct ClaimInfo {
        uint256 issuerId;
        bytes32 merkleRoot;
        uint256 issuedAt;
        uint256 expiresAt;  // 0 = never expires
        bool revoked;
    }

    // Storage
    mapping(uint256 => Issuer) public issuers;
    mapping(address => uint256) public walletToIssuerId;
    mapping(bytes32 => ClaimInfo) public claims;  // claimId => ClaimInfo

    uint256 public issuerCount;
    address public admin;

    // Eventi
    event IssuerAdded(uint256 indexed issuerId, string name, address wallet);
    event IssuerRevoked(uint256 indexed issuerId);
    event ClaimRegistered(
        address indexed user,
        bytes32 indexed claimId,
        uint256 indexed issuerId,
        string credentialType,
        bytes32 merkleRoot
    );
    event ClaimRevoked(bytes32 indexed claimId, uint256 indexed issuerId);

    // Modificatori
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyApprovedIssuer() {
        uint256 issuerId = walletToIssuerId[msg.sender];
        require(issuerId != 0, "Not an approved issuer");
        require(issuers[issuerId].active, "Issuer not active");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Aggiunge un issuer approvato (solo admin)
     * @param _name Nome dell'issuer (es. "Università Tor Vergata")
     * @param _wallet Indirizzo wallet dell'issuer
     */
    function addIssuer(string memory _name, address _wallet) public onlyAdmin {
        require(_wallet != address(0), "Invalid wallet");
        require(walletToIssuerId[_wallet] == 0, "Wallet already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        issuerCount++;
        issuers[issuerCount] = Issuer({
            name: _name,
            wallet: _wallet,
            active: true,
            addedAt: block.timestamp
        });
        walletToIssuerId[_wallet] = issuerCount;

        emit IssuerAdded(issuerCount, _name, _wallet);
    }

    /**
     * @notice Revoca un issuer (solo admin)
     */
    function revokeIssuer(uint256 _issuerId) public onlyAdmin {
        require(issuers[_issuerId].wallet != address(0), "Issuer not found");
        issuers[_issuerId].active = false;
        emit IssuerRevoked(_issuerId);
    }

    /**
     * @notice Riattiva un issuer revocato
     */
    function reactivateIssuer(uint256 _issuerId) public onlyAdmin {
        require(issuers[_issuerId].wallet != address(0), "Issuer not found");
        issuers[_issuerId].active = true;
    }

    /**
     * @notice Registra un claim disponibile per un utente
     * @dev L'issuer deve firmare off-chain: sign(keccak256(user, credType, merkleRoot, expiresAt))
     * @param _user Identificatore utente (wallet address O keccak256(email) se no wallet)
     * @param _credentialType Tipo di credenziale (es. "signedUniversity")
     * @param _merkleRoot Root del Merkle tree contenente i claims
     * @param _expiresAt Timestamp scadenza (0 = mai)
     * @param _issuerSignature Firma ECDSA dell'issuer
     */
    function registerClaim(
        address _user,
        string memory _credentialType,
        bytes32 _merkleRoot,
        uint256 _expiresAt,
        bytes memory _issuerSignature
    ) public returns (bytes32 claimId) {
        require(_user != address(0), "Invalid user address");
        require(bytes(_credentialType).length > 0, "Invalid credential type");
        require(_merkleRoot != bytes32(0), "Invalid merkle root");

        // Verifica firma issuer
        bytes32 messageHash = keccak256(
            abi.encodePacked(_user, _credentialType, _merkleRoot, _expiresAt)
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_issuerSignature);

        uint256 issuerId = walletToIssuerId[signer];
        require(issuerId != 0, "Signer not an approved issuer");
        require(issuers[issuerId].active, "Issuer not active");

        // Genera claimId unico
        claimId = keccak256(abi.encodePacked(_user, _credentialType, issuerId));

        // Verifica che non esista già
        require(claims[claimId].merkleRoot == bytes32(0), "Claim already exists");

        // Registra claim
        claims[claimId] = ClaimInfo({
            issuerId: issuerId,
            merkleRoot: _merkleRoot,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false
        });

        emit ClaimRegistered(_user, claimId, issuerId, _credentialType, _merkleRoot);
        return claimId;
    }

    /**
     * @notice Revoca un claim (solo l'issuer originale)
     */
    function revokeClaim(bytes32 _claimId, bytes memory _issuerSignature) public {
        ClaimInfo storage claim = claims[_claimId];
        require(claim.merkleRoot != bytes32(0), "Claim not found");
        require(!claim.revoked, "Claim already revoked");

        // Verifica che sia l'issuer originale
        bytes32 messageHash = keccak256(abi.encodePacked(_claimId, "REVOKE"));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_issuerSignature);

        uint256 signerId = walletToIssuerId[signer];
        require(signerId == claim.issuerId, "Not the original issuer");

        claim.revoked = true;
        emit ClaimRevoked(_claimId, claim.issuerId);
    }

    /**
     * @notice Verifica se un claim è valido
     */
    function isClaimValid(bytes32 _claimId) public view returns (bool) {
        ClaimInfo memory claim = claims[_claimId];

        if (claim.merkleRoot == bytes32(0)) return false;  // Non esiste
        if (claim.revoked) return false;  // Revocato
        if (claim.expiresAt != 0 && block.timestamp > claim.expiresAt) return false;  // Scaduto
        if (!issuers[claim.issuerId].active) return false;  // Issuer disattivato

        return true;
    }

    /**
     * @notice Ottieni informazioni su un claim
     */
    function getClaim(bytes32 _claimId) public view returns (
        uint256 issuerId,
        string memory issuerName,
        bytes32 merkleRoot,
        uint256 issuedAt,
        uint256 expiresAt,
        bool revoked
    ) {
        ClaimInfo memory claim = claims[_claimId];
        Issuer memory issuer = issuers[claim.issuerId];

        return (
            claim.issuerId,
            issuer.name,
            claim.merkleRoot,
            claim.issuedAt,
            claim.expiresAt,
            claim.revoked
        );
    }

    /**
     * @notice Ottieni informazioni su un issuer
     */
    function getIssuer(uint256 _issuerId) public view returns (
        string memory name,
        address wallet,
        bool active,
        uint256 addedAt
    ) {
        Issuer memory issuer = issuers[_issuerId];
        return (issuer.name, issuer.wallet, issuer.active, issuer.addedAt);
    }
}
