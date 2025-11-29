// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CredentialRegistry.sol";

contract CredentialRegistryTest is Test {
    CredentialRegistry public registry;

    address admin = address(1);
    address issuerWallet = address(2);
    address userWallet = address(3);

    uint256 issuerPrivateKey = 0x1234;
    address issuerAddress;

    function setUp() public {
        // Deploy contract
        vm.prank(admin);
        registry = new CredentialRegistry();

        // Genera indirizzo da chiave privata
        issuerAddress = vm.addr(issuerPrivateKey);
    }

    function testAddIssuer() public {
        vm.prank(admin);
        registry.addIssuer("Universita Tor Vergata", issuerAddress);

        (string memory name, address wallet, bool active, ) = registry.getIssuer(1);

        assertEq(name, "Universita Tor Vergata");
        assertEq(wallet, issuerAddress);
        assertTrue(active);
        assertEq(registry.issuerCount(), 1);
    }

    function testCannotAddIssuerTwice() public {
        vm.prank(admin);
        registry.addIssuer("Tor Vergata", issuerAddress);

        vm.prank(admin);
        vm.expectRevert("Wallet already registered");
        registry.addIssuer("Sapienza", issuerAddress);
    }

    function testRegisterClaim() public {
        // 1. Admin aggiunge issuer
        vm.prank(admin);
        registry.addIssuer("Tor Vergata", issuerAddress);

        // 2. Issuer prepara claim
        string memory credType = "signedUniversity";
        bytes32 merkleRoot = keccak256("test_merkle_root");
        uint256 expiresAt = block.timestamp + 365 days;

        // 3. Issuer firma off-chain
        bytes32 messageHash = keccak256(
            abi.encodePacked(userWallet, credType, merkleRoot, expiresAt)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(issuerPrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // 4. Registra claim on-chain
        bytes32 claimId = registry.registerClaim(
            userWallet,
            credType,
            merkleRoot,
            expiresAt,
            signature
        );

        // 5. Verifica claim
        assertTrue(registry.isClaimValid(claimId));

        (
            uint256 issuerId,
            string memory issuerName,
            bytes32 storedRoot,
            , // issuedAt
            uint256 storedExpiry,
            bool revoked
        ) = registry.getClaim(claimId);

        assertEq(issuerId, 1);
        assertEq(issuerName, "Tor Vergata");
        assertEq(storedRoot, merkleRoot);
        assertEq(storedExpiry, expiresAt);
        assertFalse(revoked);
        assertTrue(registry.isClaimValid(claimId));
    }

    function testCannotRegisterClaimWithInvalidSignature() public {
        vm.prank(admin);
        registry.addIssuer("Tor Vergata", issuerAddress);

        bytes32 merkleRoot = keccak256("test");
        bytes memory fakeSignature = new bytes(65);

        vm.expectRevert(); // Accept any revert (ECDSA error or not approved issuer)
        registry.registerClaim(
            userWallet,
            "signedUniversity",
            merkleRoot,
            0,
            fakeSignature
        );
    }

    function testRevokeClaim() public {
        // Setup: registra claim
        vm.prank(admin);
        registry.addIssuer("Tor Vergata", issuerAddress);

        string memory credType = "signedUniversity";
        bytes32 merkleRoot = keccak256("test");
        uint256 expiresAt = 0;

        bytes32 messageHash = keccak256(
            abi.encodePacked(userWallet, credType, merkleRoot, expiresAt)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(issuerPrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes32 claimId = registry.registerClaim(
            userWallet,
            credType,
            merkleRoot,
            expiresAt,
            signature
        );

        assertTrue(registry.isClaimValid(claimId));

        // Revoca claim
        bytes32 revokeHash = keccak256(abi.encodePacked(claimId, "REVOKE"));
        bytes32 revokeEthHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", revokeHash)
        );
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(issuerPrivateKey, revokeEthHash);
        bytes memory revokeSignature = abi.encodePacked(r2, s2, v2);

        registry.revokeClaim(claimId, revokeSignature);

        assertFalse(registry.isClaimValid(claimId));
    }

    function testExpiredClaim() public {
        vm.prank(admin);
        registry.addIssuer("Tor Vergata", issuerAddress);

        string memory credType = "signedUniversity";
        bytes32 merkleRoot = keccak256("test");
        uint256 expiresAt = block.timestamp + 1 days;

        bytes32 messageHash = keccak256(
            abi.encodePacked(userWallet, credType, merkleRoot, expiresAt)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(issuerPrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes32 claimId = registry.registerClaim(
            userWallet,
            credType,
            merkleRoot,
            expiresAt,
            signature
        );

        assertTrue(registry.isClaimValid(claimId));

        // Avanza tempo di 2 giorni
        vm.warp(block.timestamp + 2 days);

        assertFalse(registry.isClaimValid(claimId));
    }
}
