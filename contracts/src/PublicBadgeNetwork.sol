// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PublicBadgeNetwork is ERC721 {
    
    uint256 private _currentCertId;
    uint256 private _currentEntityId; // Aggiunto per contare gli enti

    struct Certificate {
        uint256 issuerId;
        string title;
        string specialization;
        uint256 issueDate;
        uint256 expiration;
        bytes32 privateHash;
        bool isValid;
    }

    struct Entity {
        string name;
        address wallet;
    }

    mapping(address => uint256) public walletToEntityId;
    mapping(uint256 => Entity) public entities;
    mapping(uint256 => Certificate) public certificates;
    
    // FIX 2: Mappa per evitare nomi duplicati
    mapping(bytes32 => bool) private _takenNames;

    // FIX 3: Dichiarazione degli Eventi
    event EntityRegistered(uint256 indexed entityId, string name);
    event BadgeIssued(uint256 indexed badgeId, uint256 indexed entityId, address recipient);

    constructor() ERC721("PublicBadge", "BADGE") {}

    function registerAsEntity(string memory _name) external {
        require(bytes(_name).length > 0, "Nome vuoto");
        require(walletToEntityId[msg.sender] == 0, "Gia' registrato");
        
        // FIX 2: Controllo unicità nome
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        require(!_takenNames[nameHash], "Nome gia' in uso");
        _takenNames[nameHash] = true;

        _currentEntityId++;
        uint256 newId = _currentEntityId; // Uso variabile locale per risparmiare gas
        
        walletToEntityId[msg.sender] = newId;
        entities[newId] = Entity(_name, msg.sender);

        emit EntityRegistered(newId, _name);
    }

    function issueBadge(
        address _student, 
        string memory _title,       
        string memory _spec,        
        uint256 _daysValid,
        string memory _privateData  
    ) external {
        uint256 issuerId = walletToEntityId[msg.sender];
        require(issuerId > 0, "Non autorizzato");

        _currentCertId++;
        uint256 newId = _currentCertId;
        _safeMint(_student, newId);

        uint256 expDate = _daysValid == 0 ? type(uint256).max : block.timestamp + (_daysValid * 1 days);

        certificates[newId] = Certificate({
            issuerId: issuerId,
            title: _title,
            specialization: _spec,
            issueDate: block.timestamp,
            expiration: expDate,
            privateHash: keccak256(abi.encodePacked(_privateData)), 
            isValid: true
        });

        emit BadgeIssued(newId, issuerId, _student);
    }

    function getBadgeInfo(uint256 certId) external view returns (
        string memory issuerName,
        string memory title,
        string memory specialization,
        string memory status,
        uint256 date
    ) {
        // FIX 1: Controllo esistenza sicuro
        // Se usi OZ v5, ownerOf revert se non esiste. 
        // Possiamo usare un blocco try/catch o fidarci del revert standard.
        // Qui usiamo il metodo standard: se ownerOf fallisce, tutta la funzione fallisce.
        address owner = ownerOf(certId); 
        require(owner != address(0), "Non esiste"); 

        Certificate memory cert = certificates[certId];
        Entity memory issuer = entities[cert.issuerId];

        string memory currentStatus = "Valido";
        if (!cert.isValid) currentStatus = "Revocato";
        else if (block.timestamp > cert.expiration) currentStatus = "Scaduto";

        return (issuer.name, cert.title, cert.specialization, currentStatus, cert.issueDate);
    }
    
    function verifyPrivateData(uint256 certId, string memory _dataToCheck) external view returns (bool) {
        return certificates[certId].privateHash == keccak256(abi.encodePacked(_dataToCheck));
    }

    // FIX 4: Bloccare i trasferimenti (Soulbound)
    function transferFrom(address, address, uint256) public pure override {
        revert("Non trasferibile");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Non trasferibile");
    }
}