# 🗺️ ROADMAP: OwnID ZKP Identity Provider

**Obiettivo**: Trasformare il prototipo Badge NFT in un Identity Provider basato su Verifiable Credentials con query selettive privacy-preserving.

**Timeline**: 3-4 settimane (hackathon-ready)
**Effort**: 1-2 developers full-time

---

## 📋 OVERVIEW FASI

```
Fase 0: Refactoring Base (2-3 giorni)
   ↓
Fase 1: Smart Contracts ZKP (4-5 giorni)
   ↓
Fase 2: Backend Claim System (3-4 giorni)
   ↓
Fase 3: Frontend Credential Management (4-5 giorni)
   ↓
Fase 4: Third-Party Integration SDK (3-4 giorni)
   ↓
Fase 5: Testing & Demo (2-3 giorni)
```

**TOTALE: 18-24 giorni**

---

## 🔧 FASE 0: REFACTORING BASE (2-3 giorni)

### Obiettivo
Preparare codebase per nuova architettura, rimuovere sistema badge NFT legacy.

### Tasks

#### 0.1 - Smart Contracts Cleanup
- [ ] Rinomina `PublicBadgeNetwork.sol` → `CredentialRegistry.sol`
- [ ] Rimuovi logica ERC721 (non servono più NFT)
- [ ] Mantieni solo: mapping issuer, firma digitale
- [ ] Aggiungi libreria Merkle Tree (OpenZeppelin)

**File**: `contracts/src/CredentialRegistry.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CredentialRegistry {
    using ECDSA for bytes32;

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
        uint256 expiresAt;
        bool revoked;
    }

    mapping(uint256 => Issuer) public issuers;
    mapping(address => uint256) public walletToIssuerId;
    mapping(bytes32 => ClaimInfo) public claims; // keccak256(userAddress, credentialType)

    uint256 public issuerCount;
    address public admin;

    event IssuerAdded(uint256 indexed issuerId, string name, address wallet);
    event ClaimRegistered(address indexed user, bytes32 indexed claimId, uint256 issuerId);
    event ClaimRevoked(bytes32 indexed claimId);

    constructor() {
        admin = msg.sender;
    }

    // ... implementazione
}
```

#### 0.2 - Backend API Restructure
- [ ] Rinomina `routes/blockchain.ts` → `routes/credentials.ts`
- [ ] Rimuovi endpoint badge legacy (`/issue-badge`, `/badge/:id`)
- [ ] Crea nuova struttura:
  - `POST /api/credentials/register-claim` (issuer only)
  - `GET /api/credentials/available` (user claims disponibili)
  - `POST /api/credentials/claim/:id` (esegui claim)

**File**: `back-end/routes/credentials.ts`

#### 0.3 - Database Migration
- [ ] Aggiungi tabella `credentials`:
```sql
CREATE TABLE credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    credential_type TEXT NOT NULL,
    issuer_id INTEGER NOT NULL,
    merkle_root TEXT NOT NULL,
    claim_data JSONB NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, credential_type, issuer_id)
);

CREATE INDEX idx_credentials_user ON credentials(user_id);
CREATE INDEX idx_credentials_type ON credentials(credential_type);
```

- [ ] Aggiungi tabella `issuer_keys` (per gestione chiavi issuer):
```sql
CREATE TABLE issuer_keys (
    issuer_id INTEGER PRIMARY KEY,
    issuer_name TEXT UNIQUE NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 0.4 - Frontend Cleanup
- [ ] Rimuovi logica badge NFT da dashboard
- [ ] Crea nuova struttura cartelle:
  - `app/credentials/` - gestione credenziali user
  - `app/widget/` - widget per terze parti
  - `app/admin/` - pannello issuer (hardcoded)

**File Modificati**:
- `front-end/app/dashboard/page.tsx`
- `front-end/app/context/AuthContext.tsx` → `app/context/CredentialContext.tsx`

#### 0.5 - Configurazione Issuer Hardcoded
- [ ] Crea file config con lista issuer approvati:

**File**: `back-end/config/approved-issuers.json`
```json
{
  "issuers": [
    {
      "id": 1,
      "name": "Università Tor Vergata",
      "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "publicKey": "0x...",
      "types": ["signedUniversity", "studentStatus"]
    },
    {
      "id": 2,
      "name": "Sapienza Università di Roma",
      "wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "publicKey": "0x...",
      "types": ["signedUniversity", "studentStatus"]
    }
  ]
}
```

**Deliverables Fase 0**:
- ✅ Smart contract ripulito e rinominato
- ✅ Backend API ristrutturato
- ✅ Database schema aggiornato
- ✅ Frontend preparato per nuove feature
- ✅ Config issuer hardcoded

---

## 🔐 FASE 1: SMART CONTRACTS ZKP (4-5 giorni)

### Obiettivo
Implementare smart contracts per sistema credenziali con Merkle proofs e query selettive.

### Tasks

#### 1.1 - CredentialRegistry Contract
**File**: `contracts/src/CredentialRegistry.sol`

- [ ] Implementa gestione issuer:
```solidity
function addIssuer(string memory _name, address _wallet) public onlyAdmin {
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

function revokeIssuer(uint256 issuerId) public onlyAdmin {
    issuers[issuerId].active = false;
}
```

- [ ] Implementa registrazione claim:
```solidity
function registerClaim(
    address user,
    string memory credentialType,
    bytes32 merkleRoot,
    uint256 expiresAt,
    bytes memory issuerSignature
) public returns (bytes32 claimId) {
    // Verifica firma issuer
    bytes32 messageHash = keccak256(abi.encodePacked(user, credentialType, merkleRoot, expiresAt));
    address signer = messageHash.toEthSignedMessageHash().recover(issuerSignature);

    uint256 issuerId = walletToIssuerId[signer];
    require(issuerId != 0, "Not an approved issuer");
    require(issuers[issuerId].active, "Issuer not active");

    claimId = keccak256(abi.encodePacked(user, credentialType));

    claims[claimId] = ClaimInfo({
        issuerId: issuerId,
        merkleRoot: merkleRoot,
        issuedAt: block.timestamp,
        expiresAt: expiresAt,
        revoked: false
    });

    emit ClaimRegistered(user, claimId, issuerId);
    return claimId;
}
```

- [ ] Implementa revoca:
```solidity
function revokeClaim(bytes32 claimId, bytes memory issuerSignature) public {
    ClaimInfo storage claim = claims[claimId];
    require(claim.issuerId != 0, "Claim not found");

    // Verifica che sia l'issuer originale
    bytes32 messageHash = keccak256(abi.encodePacked(claimId, "REVOKE"));
    address signer = messageHash.toEthSignedMessageHash().recover(issuerSignature);
    require(walletToIssuerId[signer] == claim.issuerId, "Not the issuer");

    claim.revoked = true;
    emit ClaimRevoked(claimId);
}
```

#### 1.2 - VerificationHub Contract
**File**: `contracts/src/VerificationHub.sol`

- [ ] Implementa verifica base:
```solidity
contract VerificationHub {
    CredentialRegistry public registry;

    struct VerificationRequest {
        address user;
        string claimType;
        bytes32[] merkleProof;
        bytes32 leafValue;
    }

    event VerificationCompleted(
        address indexed user,
        address indexed verifier,
        string claimType,
        bool success,
        uint256 timestamp
    );

    constructor(address _registry) {
        registry = CredentialRegistry(_registry);
    }

    function verifyClaim(VerificationRequest calldata req)
        public
        returns (bool verified, uint256 issuerId)
    {
        bytes32 claimId = keccak256(abi.encodePacked(req.user, req.claimType));
        CredentialRegistry.ClaimInfo memory claim = registry.getClaim(claimId);

        require(claim.issuerId != 0, "Claim not found");
        require(!claim.revoked, "Claim revoked");
        require(block.timestamp <= claim.expiresAt || claim.expiresAt == 0, "Claim expired");

        // Verifica Merkle proof
        bool proofValid = MerkleProof.verify(
            req.merkleProof,
            claim.merkleRoot,
            req.leafValue
        );

        emit VerificationCompleted(
            req.user,
            msg.sender,
            req.claimType,
            proofValid,
            block.timestamp
        );

        return (proofValid, claim.issuerId);
    }
}
```

- [ ] Implementa query selettive multi-issuer:
```solidity
function verifyClaimWithIssuers(
    VerificationRequest calldata req,
    uint256[] calldata allowedIssuerIds
) public returns (bool verified, uint256 matchedIssuerId) {
    (bool valid, uint256 issuerId) = verifyClaim(req);

    if (!valid) return (false, 0);

    // Verifica issuer in whitelist
    for (uint i = 0; i < allowedIssuerIds.length; i++) {
        if (issuerId == allowedIssuerIds[i]) {
            return (true, issuerId);
        }
    }

    return (false, 0);
}
```

#### 1.3 - Libreria Merkle Utils
**File**: `contracts/src/libraries/MerkleUtils.sol`

- [ ] Helper per generazione Merkle tree lato backend:
```solidity
library MerkleUtils {
    function hashLeaf(string memory key, string memory value)
        internal pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(key, ":", value));
    }

    function hashPair(bytes32 a, bytes32 b)
        internal pure returns (bytes32)
    {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }
}
```

#### 1.4 - Testing Contracts
**File**: `contracts/test/CredentialSystem.t.sol`

- [ ] Test completo sistema:
  - Registrazione issuer
  - Registrazione claim con firma valida
  - Verifica Merkle proof
  - Query multi-issuer
  - Revoca claim
  - Scadenza credenziali

```solidity
function testCompleteFlow() public {
    // Setup issuer
    vm.prank(admin);
    registry.addIssuer("Tor Vergata", issuerWallet);

    // Generate Merkle tree
    bytes32[] memory leaves = new bytes32[](3);
    leaves[0] = keccak256(abi.encodePacked("isStudent:true"));
    leaves[1] = keccak256(abi.encodePacked("university:TorVergata"));
    leaves[2] = keccak256(abi.encodePacked("year:2023"));
    bytes32 root = merkle.getRoot(leaves);

    // Sign claim
    bytes32 messageHash = keccak256(abi.encodePacked(
        userAddress, "signedUniversity", root, expirationTime
    ));
    bytes memory signature = signMessage(issuerPrivateKey, messageHash);

    // Register claim
    vm.prank(issuerWallet);
    bytes32 claimId = registry.registerClaim(
        userAddress, "signedUniversity", root, expirationTime, signature
    );

    // Verify claim
    bytes32[] memory proof = merkle.getProof(leaves, 0);
    bool verified = verificationHub.verifyClaim(VerificationRequest({
        user: userAddress,
        claimType: "signedUniversity",
        merkleProof: proof,
        leafValue: leaves[0]
    }));

    assertTrue(verified);
}
```

#### 1.5 - Deploy Scripts
**File**: `contracts/script/DeployCredentialSystem.s.sol`

- [ ] Script deploy completo:
```solidity
contract DeployCredentialSystem is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy registry
        CredentialRegistry registry = new CredentialRegistry();
        console.log("CredentialRegistry:", address(registry));

        // Deploy verification hub
        VerificationHub hub = new VerificationHub(address(registry));
        console.log("VerificationHub:", address(hub));

        // Add initial issuers
        registry.addIssuer("Tor Vergata", vm.envAddress("ISSUER_1_WALLET"));
        registry.addIssuer("Sapienza", vm.envAddress("ISSUER_2_WALLET"));

        vm.stopBroadcast();
    }
}
```

**Deliverables Fase 1**:
- ✅ CredentialRegistry contract funzionante
- ✅ VerificationHub con query selettive
- ✅ Test suite completo (>90% coverage)
- ✅ Deploy scripts per local/testnet

---

## 🖥️ FASE 2: BACKEND CLAIM SYSTEM (3-4 giorni)

### Obiettivo
API backend per gestione claim, generazione credenziali, integrazione smart contracts.

### Tasks

#### 2.1 - Servizio Merkle Tree
**File**: `back-end/services/merkle.ts`

- [ ] Implementa generazione Merkle tree:
```typescript
import { keccak256 } from 'ethers';

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

export class MerkleTreeGenerator {
  static hashLeaf(key: string, value: any): string {
    const data = `${key}:${JSON.stringify(value)}`;
    return keccak256(Buffer.from(data));
  }

  static hashPair(a: string, b: string): string {
    const sorted = [a, b].sort();
    return keccak256(Buffer.from(sorted[0] + sorted[1]));
  }

  static generate(claims: Record<string, any>): MerkleTree {
    const leaves = Object.entries(claims).map(([key, value]) =>
      this.hashLeaf(key, value)
    );

    const layers: string[][] = [leaves];
    let currentLayer = leaves;

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    return {
      root: currentLayer[0],
      leaves,
      layers
    };
  }

  static getProof(tree: MerkleTree, leafIndex: number): string[] {
    const proof: string[] = [];
    let index = leafIndex;

    for (let i = 0; i < tree.layers.length - 1; i++) {
      const layer = tree.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }
}
```

#### 2.2 - Servizio Credential Generation
**File**: `back-end/services/credential-generator.ts`

- [ ] Template credenziale W3C:
```typescript
import { MerkleTreeGenerator } from './merkle.ts';
import { ethers } from 'ethers';

export interface CredentialData {
  userId: string;
  userAddress: string;
  credentialType: string;
  issuerId: number;
  issuerName: string;
  claims: Record<string, any>;
  expiresAt?: Date;
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    claims: Record<string, any>;
  };
  proof: {
    type: string;
    merkleRoot: string;
    merkleTree: {
      leaves: string[];
      layers: string[][];
    };
    issuerSignature: string;
  };
}

export class CredentialGenerator {
  static async generate(
    data: CredentialData,
    issuerWallet: ethers.Wallet
  ): Promise<VerifiableCredential> {
    // Genera Merkle tree
    const merkleTree = MerkleTreeGenerator.generate(data.claims);

    // Firma Merkle root
    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'string', 'bytes32', 'uint256'],
        [
          data.userAddress,
          data.credentialType,
          merkleTree.root,
          data.expiresAt ? Math.floor(data.expiresAt.getTime() / 1000) : 0
        ]
      )
    );

    const signature = await issuerWallet.signMessage(
      ethers.getBytes(messageHash)
    );

    // Costruisci credenziale
    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ['VerifiableCredential', data.credentialType],
      issuer: {
        id: issuerWallet.address,
        name: data.issuerName
      },
      issuanceDate: new Date().toISOString(),
      expirationDate: data.expiresAt?.toISOString(),
      credentialSubject: {
        id: data.userAddress,
        claims: data.claims
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        merkleRoot: merkleTree.root,
        merkleTree: {
          leaves: merkleTree.leaves,
          layers: merkleTree.layers
        },
        issuerSignature: signature
      }
    };

    return credential;
  }

  static generateProof(
    credential: VerifiableCredential,
    claimKey: string
  ): { leafValue: string; proof: string[] } {
    const leafIndex = Object.keys(credential.credentialSubject.claims).indexOf(claimKey);
    if (leafIndex === -1) {
      throw new Error(`Claim ${claimKey} not found`);
    }

    const leafValue = credential.proof.merkleTree.leaves[leafIndex];
    const proof = MerkleTreeGenerator.getProof(
      {
        root: credential.proof.merkleRoot,
        leaves: credential.proof.merkleTree.leaves,
        layers: credential.proof.merkleTree.layers
      },
      leafIndex
    );

    return { leafValue, proof };
  }
}
```

#### 2.3 - API Endpoints Credentials
**File**: `back-end/routes/credentials.ts`

- [ ] **POST /api/credentials/register-claim** (Issuer only)
```typescript
router.post('/register-claim', async (ctx) => {
  const { userId, credentialType, claims, expiresAt } = await ctx.request.body().value;

  // Verifica issuer authorization
  const issuerKey = ctx.request.headers.get('X-Issuer-Key');
  const issuer = await getIssuerByKey(issuerKey);
  if (!issuer) {
    ctx.response.status = 401;
    ctx.response.body = { error: 'Unauthorized issuer' };
    return;
  }

  // Ottieni user address
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (!user.rows.length) {
    ctx.response.status = 404;
    ctx.response.body = { error: 'User not found' };
    return;
  }

  const userAddress = user.rows[0].wallet_address; // TODO: aggiungere al db

  // Genera credenziale
  const issuerWallet = new ethers.Wallet(issuer.privateKey);
  const credential = await CredentialGenerator.generate(
    {
      userId,
      userAddress,
      credentialType,
      issuerId: issuer.id,
      issuerName: issuer.name,
      claims,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    },
    issuerWallet
  );

  // Registra on-chain
  const registry = new ethers.Contract(
    CONTRACT_ADDRESS,
    CredentialRegistryABI,
    issuerWallet
  );

  const tx = await registry.registerClaim(
    userAddress,
    credentialType,
    credential.proof.merkleRoot,
    expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0,
    credential.proof.issuerSignature
  );
  await tx.wait();

  // Salva nel database
  await db.query(
    `INSERT INTO credentials (id, user_id, credential_type, issuer_id, merkle_root, claim_data, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      credential.id,
      userId,
      credentialType,
      issuer.id,
      credential.proof.merkleRoot,
      JSON.stringify(credential),
      expiresAt
    ]
  );

  ctx.response.status = 201;
  ctx.response.body = {
    success: true,
    credentialId: credential.id,
    message: 'Claim registered successfully'
  };
});
```

- [ ] **GET /api/credentials/available** (User authenticated)
```typescript
router.get('/available', authenticateToken, async (ctx) => {
  const userId = ctx.state.user.userId;

  const result = await db.query(
    `SELECT c.*, i.issuer_name
     FROM credentials c
     JOIN issuer_keys i ON c.issuer_id = i.issuer_id
     WHERE c.user_id = $1
     ORDER BY c.claimed_at DESC`,
    [userId]
  );

  ctx.response.body = {
    credentials: result.rows.map(row => ({
      id: row.id,
      type: row.credential_type,
      issuer: row.issuer_name,
      claimedAt: row.claimed_at,
      expiresAt: row.expires_at,
      claimed: !!row.claimed_at
    }))
  };
});
```

- [ ] **POST /api/credentials/claim/:id** (User authenticated)
```typescript
router.post('/claim/:id', authenticateToken, async (ctx) => {
  const credentialId = ctx.params.id;
  const userId = ctx.state.user.userId;

  const result = await db.query(
    'SELECT * FROM credentials WHERE id = $1 AND user_id = $2',
    [credentialId, userId]
  );

  if (!result.rows.length) {
    ctx.response.status = 404;
    ctx.response.body = { error: 'Credential not found' };
    return;
  }

  const credential = JSON.parse(result.rows[0].claim_data);

  ctx.response.body = {
    success: true,
    credential
  };
});
```

#### 2.4 - Admin Panel API (Issuer Management)
**File**: `back-end/routes/admin.ts`

- [ ] **GET /api/admin/issuers** - Lista issuer approvati
- [ ] **POST /api/admin/issuers** - Aggiungi issuer (only admin)
- [ ] **DELETE /api/admin/issuers/:id** - Revoca issuer

**Deliverables Fase 2**:
- ✅ Servizio Merkle tree funzionante
- ✅ Generatore credenziali W3C-compliant
- ✅ API endpoints per claim
- ✅ Integrazione smart contracts
- ✅ Admin panel per issuer

---

## 🎨 FASE 3: FRONTEND CREDENTIAL MANAGEMENT (4-5 giorni)

### Obiettivo
Dashboard user per gestione credenziali, visualizzazione claim disponibili, claim execution.

### Tasks

#### 3.1 - Context Provider Credentials
**File**: `front-end/app/context/CredentialContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Credential {
  id: string;
  type: string;
  issuer: string;
  claimedAt: string;
  expiresAt?: string;
  data?: any;
}

interface CredentialContextType {
  credentials: Credential[];
  availableCredentials: Credential[];
  loading: boolean;
  claimCredential: (id: string) => Promise<void>;
  refreshCredentials: () => Promise<void>;
}

const CredentialContext = createContext<CredentialContextType | undefined>(undefined);

export function CredentialProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [availableCredentials, setAvailableCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCredentials = async () => {
    const token = localStorage.getItem('ownid_token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/api/credentials/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      setAvailableCredentials(data.credentials.filter((c: Credential) => !c.claimedAt));

      // Carica credenziali già claimed da localStorage
      const stored = localStorage.getItem('ownid_credentials');
      if (stored) {
        setCredentials(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimCredential = async (id: string) => {
    const token = localStorage.getItem('ownid_token');
    const res = await fetch(`http://localhost:8000/api/credentials/claim/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.success) {
      const newCredentials = [...credentials, data.credential];
      setCredentials(newCredentials);
      localStorage.setItem('ownid_credentials', JSON.stringify(newCredentials));
      await loadCredentials(); // Refresh
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  return (
    <CredentialContext.Provider value={{
      credentials,
      availableCredentials,
      loading,
      claimCredential,
      refreshCredentials: loadCredentials
    }}>
      {children}
    </CredentialContext.Provider>
  );
}

export const useCredentials = () => {
  const context = useContext(CredentialContext);
  if (!context) throw new Error('useCredentials must be used within CredentialProvider');
  return context;
};
```

#### 3.2 - Dashboard Credentials
**File**: `front-end/app/dashboard/credentials/page.tsx`

```typescript
'use client';

import { useCredentials } from '@/app/context/CredentialContext';

export default function CredentialsPage() {
  const { credentials, availableCredentials, loading, claimCredential } = useCredentials();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Le Mie Credenziali</h1>

      {/* Credenziali Disponibili */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Disponibili per il Claim</h2>
        {availableCredentials.length === 0 ? (
          <p className="text-gray-500">Nessuna credenziale disponibile al momento.</p>
        ) : (
          <div className="grid gap-4">
            {availableCredentials.map(cred => (
              <div key={cred.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{cred.type}</h3>
                    <p className="text-sm text-gray-600">Emesso da: {cred.issuer}</p>
                  </div>
                  <button
                    onClick={() => claimCredential(cred.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Credenziali Attive */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Credenziali Attive</h2>
        {credentials.length === 0 ? (
          <p className="text-gray-500">Non hai ancora credenziali attive.</p>
        ) : (
          <div className="grid gap-4">
            {credentials.map(cred => (
              <div key={cred.id} className="border rounded-lg p-6 bg-green-50">
                <h3 className="text-xl font-semibold">{cred.type}</h3>
                <p className="text-sm text-gray-600">Emesso da: {cred.issuer}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Claimed: {new Date(cred.claimedAt).toLocaleDateString()}
                </p>
                {cred.expiresAt && (
                  <p className="text-sm text-gray-500">
                    Scade: {new Date(cred.expiresAt).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600">
                      Visualizza Claims
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(cred.data?.credentialSubject?.claims, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

#### 3.3 - Componente Credential Card
**File**: `front-end/app/components/CredentialCard.tsx`

- [ ] Card riutilizzabile per visualizzazione credenziale
- [ ] Badge status (attivo/scaduto)
- [ ] Azioni: visualizza dettagli, genera proof

#### 3.4 - Admin Panel Issuer (Solo per demo)
**File**: `front-end/app/admin/page.tsx`

```typescript
'use client';

export default function AdminIssuerPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [credentialData, setCredentialData] = useState({
    type: 'signedUniversity',
    claims: {
      isStudent: true,
      university: 'Tor Vergata',
      faculty: 'Ingegneria',
      enrollmentYear: 2023
    }
  });

  const issueCredential = async () => {
    await fetch('http://localhost:8000/api/credentials/register-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Issuer-Key': 'ISSUER_SECRET_KEY' // Demo only
      },
      body: JSON.stringify({
        userId: selectedUser,
        credentialType: credentialData.type,
        claims: credentialData.claims,
        expiresAt: null
      })
    });

    alert('Credenziale emessa con successo!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Pannello Issuer</h1>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl mb-4">Emetti Nuova Credenziale</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Utente</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleziona utente...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Tipo Credenziale</label>
            <input
              type="text"
              value={credentialData.type}
              onChange={(e) => setCredentialData({...credentialData, type: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Claims (JSON)</label>
            <textarea
              value={JSON.stringify(credentialData.claims, null, 2)}
              onChange={(e) => setCredentialData({...credentialData, claims: JSON.parse(e.target.value)})}
              className="w-full border p-2 rounded font-mono text-sm"
              rows={10}
            />
          </div>

          <button
            onClick={issueCredential}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Emetti Credenziale
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables Fase 3**:
- ✅ Dashboard credenziali funzionante
- ✅ Sistema di claim user-friendly
- ✅ Visualizzazione credenziali attive
- ✅ Admin panel per demo issuer

---

## 🔌 FASE 4: THIRD-PARTY INTEGRATION SDK (3-4 giorni)

### Obiettivo
Widget embeddabile e SDK JavaScript per integrazione in siti terzi (es. Spotify).

### Tasks

#### 4.1 - OwnID Widget (iframe)
**File**: `front-end/app/widget/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface VerificationRequest {
  claim: string;
  issuers?: string[];
  callback?: string;
}

export default function WidgetPage() {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [step, setStep] = useState<'loading' | 'select' | 'approve' | 'verifying' | 'done'>('loading');

  useEffect(() => {
    // Ricevi richiesta da window.postMessage (sito terzo)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OWNID_VERIFY_REQUEST') {
        setRequest(event.data.payload);
        findMatchingCredentials(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // Notifica parent che widget è pronto
    window.parent.postMessage({ type: 'OWNID_WIDGET_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const findMatchingCredentials = (req: VerificationRequest) => {
    const stored = localStorage.getItem('ownid_credentials');
    if (!stored) {
      setStep('done');
      sendResult({ verified: false, error: 'No credentials found' });
      return;
    }

    const allCreds = JSON.parse(stored);

    // Filtra credenziali che matchano il claim richiesto
    const matching = allCreds.filter((cred: any) => {
      const hasClaim = cred.credentialSubject.claims[req.claim] !== undefined;
      const issuerMatch = !req.issuers || req.issuers.includes(cred.issuer.name);
      return hasClaim && issuerMatch;
    });

    if (matching.length === 0) {
      setStep('done');
      sendResult({ verified: false, error: 'No matching credentials' });
      return;
    }

    setCredentials(matching);
    setSelectedCredential(matching[0]);
    setStep('select');
  };

  const handleApprove = async () => {
    setStep('verifying');

    try {
      // Genera Merkle proof per il claim richiesto
      const claimKey = request!.claim;
      const claimValue = selectedCredential.credentialSubject.claims[claimKey];

      const leafValue = ethers.keccak256(
        ethers.toUtf8Bytes(`${claimKey}:${JSON.stringify(claimValue)}`)
      );

      const proof = generateMerkleProof(selectedCredential, claimKey);

      // Chiama smart contract per verifica
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const verificationHub = new ethers.Contract(
        VERIFICATION_HUB_ADDRESS,
        VerificationHubABI,
        signer
      );

      const allowedIssuerIds = request!.issuers
        ? await getIssuerIds(request!.issuers)
        : [];

      const tx = await verificationHub.verifyClaim({
        user: selectedCredential.credentialSubject.id,
        claimType: selectedCredential.type[1],
        merkleProof: proof,
        leafValue: leafValue
      });

      const receipt = await tx.wait();

      setStep('done');
      sendResult({
        verified: true,
        claim: request!.claim,
        issuer: selectedCredential.issuer.name,
        txHash: receipt.hash
      });
    } catch (error) {
      console.error('Verification failed:', error);
      setStep('done');
      sendResult({ verified: false, error: error.message });
    }
  };

  const sendResult = (result: any) => {
    window.parent.postMessage({
      type: 'OWNID_VERIFY_RESULT',
      payload: result
    }, '*');
  };

  const generateMerkleProof = (credential: any, claimKey: string): string[] => {
    // Implementazione generazione proof da Merkle tree salvato
    const tree = credential.proof.merkleTree;
    const leaves = tree.leaves;
    const layers = tree.layers;

    const claimIndex = Object.keys(credential.credentialSubject.claims).indexOf(claimKey);

    // Calcola siblings per proof
    const proof: string[] = [];
    let index = claimIndex;

    for (let i = 0; i < layers.length - 1; i++) {
      const layer = layers[i];
      const isRight = index % 2 === 1;
      const siblingIndex = isRight ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'loading' && <div>Caricamento...</div>}

      {step === 'select' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Seleziona Credenziale</h2>
          <p className="mb-4">
            Il sito richiede verifica: <strong>{request?.claim}</strong>
          </p>

          <div className="space-y-2">
            {credentials.map((cred: any, i) => (
              <div
                key={i}
                onClick={() => setSelectedCredential(cred)}
                className={`border p-4 rounded cursor-pointer ${
                  selectedCredential === cred ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold">{cred.type[1]}</div>
                <div className="text-sm text-gray-600">Issuer: {cred.issuer.name}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('approve')}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Continua
          </button>
        </div>
      )}

      {step === 'approve' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Autorizza Condivisione</h2>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            <p className="font-semibold mb-2">Cosa verrà condiviso:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Claim: {request?.claim}</li>
              <li>Issuer: {selectedCredential.issuer.name}</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
            <p className="font-semibold mb-2">Cosa NON verrà condiviso:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Nome e cognome</li>
              <li>Dati personali</li>
              <li>Altri claims della credenziale</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.parent.postMessage({ type: 'OWNID_CANCEL' }, '*')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded hover:bg-gray-400"
            >
              Annulla
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700"
            >
              Autorizza
            </button>
          </div>
        </div>
      )}

      {step === 'verifying' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verifica in corso sulla blockchain...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <p className="text-xl font-semibold">Verifica Completata</p>
          <p className="text-sm text-gray-600 mt-2">Questa finestra si chiuderà automaticamente...</p>
        </div>
      )}
    </div>
  );
}
```

#### 4.2 - SDK JavaScript
**File**: `sdk/ownid-sdk.ts` (nuovo progetto npm)

```typescript
export interface OwnIDConfig {
  widgetUrl?: string;
  network?: 'avalanche' | 'avalanche-fuji' | 'localhost';
}

export interface VerifyOptions {
  claim: string;
  issuers?: string[];
  timeout?: number;
}

export interface VerifyResult {
  verified: boolean;
  claim?: string;
  issuer?: string;
  txHash?: string;
  error?: string;
}

export class OwnIDVerifier {
  private config: Required<OwnIDConfig>;
  private widgetWindow: Window | null = null;

  constructor(config: OwnIDConfig = {}) {
    this.config = {
      widgetUrl: config.widgetUrl || 'https://ownid.com/widget',
      network: config.network || 'avalanche'
    };
  }

  async verify(options: VerifyOptions): Promise<VerifyResult> {
    return new Promise((resolve, reject) => {
      // Apri popup widget
      const width = 400;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      this.widgetWindow = window.open(
        this.config.widgetUrl,
        'OwnID Verification',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!this.widgetWindow) {
        reject(new Error('Failed to open widget window'));
        return;
      }

      // Timeout
      const timeout = setTimeout(() => {
        this.widgetWindow?.close();
        reject(new Error('Verification timeout'));
      }, options.timeout || 300000); // 5 min default

      // Listen for widget ready
      const handleMessage = (event: MessageEvent) => {
        if (event.source !== this.widgetWindow) return;

        if (event.data.type === 'OWNID_WIDGET_READY') {
          // Invia richiesta verifica
          this.widgetWindow!.postMessage({
            type: 'OWNID_VERIFY_REQUEST',
            payload: {
              claim: options.claim,
              issuers: options.issuers
            }
          }, '*');
        }

        if (event.data.type === 'OWNID_VERIFY_RESULT') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          this.widgetWindow?.close();
          resolve(event.data.payload);
        }

        if (event.data.type === 'OWNID_CANCEL') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          this.widgetWindow?.close();
          reject(new Error('User cancelled verification'));
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  (window as any).OwnIDVerifier = OwnIDVerifier;
}
```

#### 4.3 - Esempio Integrazione Spotify
**File**: `examples/spotify-integration.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Spotify Student Discount - OwnID Demo</title>
  <script src="https://cdn.ownid.com/sdk/v1/ownid.js"></script>
</head>
<body>
  <h1>Spotify Student Discount</h1>

  <div id="student-section" style="display: none;">
    <h2>✓ Sconto Studente Attivo</h2>
    <p>Hai accesso a Spotify Premium a €4.99/mese</p>
  </div>

  <div id="verify-section">
    <p>Verifica il tuo status di studente con OwnID per ottenere lo sconto.</p>
    <button onclick="verifyStudent()">Verifica con OwnID</button>
  </div>

  <script>
    const ownid = new OwnIDVerifier();

    async function verifyStudent() {
      try {
        const result = await ownid.verify({
          claim: 'isStudent',
          issuers: ['Tor Vergata', 'Sapienza', 'Roma Tre', 'Politecnico Milano']
        });

        if (result.verified) {
          document.getElementById('verify-section').style.display = 'none';
          document.getElementById('student-section').style.display = 'block';

          console.log('Student verified!', result);
          // Invia a backend Spotify per applicare sconto
          await fetch('/api/apply-student-discount', {
            method: 'POST',
            body: JSON.stringify({
              ownidVerification: result.txHash,
              university: result.issuer
            })
          });
        } else {
          alert('Verifica fallita: ' + result.error);
        }
      } catch (error) {
        console.error('Verification error:', error);
        alert('Errore durante la verifica');
      }
    }
  </script>
</body>
</html>
```

#### 4.4 - NPM Package Setup
**File**: `sdk/package.json`

```json
{
  "name": "@ownid/sdk",
  "version": "1.0.0",
  "description": "OwnID Verifiable Credentials SDK",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "publish": "npm publish --access public"
  },
  "keywords": ["identity", "zkp", "credentials", "blockchain"],
  "author": "OwnID Team",
  "license": "MIT"
}
```

**Deliverables Fase 4**:
- ✅ Widget iframe funzionante
- ✅ SDK JavaScript pubblicabile
- ✅ Esempi integrazione (Spotify demo)
- ✅ Documentazione SDK

---

## 🧪 FASE 5: TESTING & DEMO (2-3 giorni)

### Obiettivo
Testing completo sistema, demo funzionante per hackathon, documentazione.

### Tasks

#### 5.1 - Testing End-to-End

- [ ] **Test Case 1: Emissione e Claim**
  1. Issuer emette credenziale per user
  2. User vede credenziale disponibile
  3. User esegue claim
  4. Credenziale salvata in localStorage
  5. Verifica on-chain claim registrato

- [ ] **Test Case 2: Verifica Spotify**
  1. User ha credenziale "signedUniversity"
  2. Apre demo Spotify
  3. Click "Verifica con OwnID"
  4. Widget si apre, mostra credenziale
  5. User approva
  6. Smart contract verifica Merkle proof
  7. Spotify riceve conferma

- [ ] **Test Case 3: Query Selettive**
  1. User ha credenziale Tor Vergata
  2. Sito richiede: "isStudent da [Sapienza, Tor Vergata]"
  3. Verifica succede (Tor Vergata è nella lista)
  4. Sito richiede: "isStudent da [Roma Tre]"
  5. Verifica fallisce (Tor Vergata non in lista)

- [ ] **Test Case 4: Revoca**
  1. Issuer revoca credenziale
  2. User prova a usarla
  3. Verifica fallisce (revoked on-chain)

- [ ] **Test Case 5: Scadenza**
  1. Credenziale con expiration
  2. Avanza tempo (Anvil: `evm_increaseTime`)
  3. Verifica fallisce (expired)

#### 5.2 - Demo Setup

- [ ] Script setup automatico:

**File**: `demo-setup.sh`
```bash
#!/bin/bash

echo "🚀 OwnID Demo Setup"

# 1. Start database
echo "Starting PostgreSQL..."
docker-compose up -d
sleep 5

# 2. Start blockchain
echo "Starting Anvil..."
cd contracts
anvil &
ANVIL_PID=$!
sleep 3

# 3. Deploy contracts
echo "Deploying contracts..."
forge script script/DeployCredentialSystem.s.sol --broadcast --rpc-url http://localhost:8545
CONTRACT_ADDRESS=$(cat broadcast/latest-deployment.json | jq -r '.address')

# 4. Update backend config
echo "Updating backend config..."
cd ../back-end
echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env

# 5. Start backend
echo "Starting backend..."
deno task dev &
BACKEND_PID=$!
sleep 3

# 6. Start frontend
echo "Starting frontend..."
cd ../front-end
pnpm install
pnpm dev &
FRONTEND_PID=$!

# 7. Seed demo data
echo "Seeding demo data..."
sleep 5
node ../scripts/seed-demo-data.js

echo "✓ Demo ready!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Widget: http://localhost:3000/widget"
echo ""
echo "Demo Users:"
echo "  - student@ownid.com / password123"
echo "  - issuer@torvergata.it / issuer123"
```

#### 5.3 - Seed Demo Data
**File**: `scripts/seed-demo-data.js`

```javascript
// Crea users di test
// Registra issuer su contract
// Emette credenziali di esempio
```

#### 5.4 - Documentazione

- [ ] **README Principale** - Update con nuova architettura
- [ ] **SDK Documentation** - `sdk/README.md`
- [ ] **Integration Guide** - `docs/INTEGRATION.md`
- [ ] **API Reference** - `docs/API.md`
- [ ] **Demo Video** - Registra walkthrough completo

#### 5.5 - Presentazione Hackathon

**File**: `PITCH.md`

- [ ] Problema: Privacy SPID
- [ ] Soluzione: OwnID ZKP
- [ ] Demo live
- [ ] Tech stack (Avalanche!)
- [ ] Roadmap futura

**Deliverables Fase 5**:
- ✅ Test suite completo
- ✅ Demo funzionante one-click setup
- ✅ Documentazione completa
- ✅ Presentazione pronta

---

## 📦 DELIVERABLES FINALI

### Smart Contracts
- `CredentialRegistry.sol` - Registro credenziali e issuer
- `VerificationHub.sol` - Verifica query selettive
- `MerkleUtils.sol` - Libreria utility
- Test suite Foundry (>90% coverage)

### Backend
- API credentials management
- Merkle tree generator
- Credential generator (W3C format)
- Issuer admin panel
- Smart contract integration

### Frontend
- Dashboard credenziali
- Claim flow
- Widget iframe
- Admin issuer panel

### SDK
- `@ownid/sdk` - NPM package
- Browser e Node.js support
- TypeScript types
- Esempi integrazione

### Documentation
- Architecture docs
- API reference
- SDK guide
- Integration examples
- Demo setup

---

## 🎯 SUCCESS CRITERIA

- [ ] User può ricevere credenziale da issuer hardcoded
- [ ] User può eseguire claim e salvare in localStorage
- [ ] Sito terzo può verificare claim senza vedere dati
- [ ] Query selettive funzionano (multi-issuer)
- [ ] Smart contract verifica Merkle proofs
- [ ] Demo Spotify funziona end-to-end
- [ ] SDK installabile e funzionante
- [ ] Revoca credenziali funziona
- [ ] Zero data leaks (solo hash on-chain)
- [ ] Deploy su Avalanche Fuji testnet

---

## 🔄 NEXT STEPS POST-HACKATHON

### V2 Features (Opzionali)
1. **Wallet Integration**: MetaMask per firma transazioni
2. **Mobile SDK**: React Native / Flutter
3. **Multi-chain**: Ethereum, Polygon support
4. **Advanced ZKP**: zk-SNARKs per query complesse
5. **Revocation Lists**: On-chain merkle tree revocazioni
6. **Credential Marketplace**: Issuer discovery
7. **DID Integration**: W3C Decentralized Identifiers
8. **Biometric Auth**: Face ID / Touch ID

### Production Hardening
- Rate limiting & DDoS protection
- Hardware wallet support (Ledger)
- Audit smart contracts (CertiK, OpenZeppelin)
- GDPR compliance audit
- Penetration testing
- Load testing (1M users)

---

**Estimated Total Development Time: 18-24 giorni**
**Team Size: 1-2 developers**
**Hackathon Ready: ✅ YES**
