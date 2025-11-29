# OwnID - Decentralized Identity Provider

Privacy-preserving verifiable credentials system using blockchain and Merkle tree proofs.

## Architecture

**Hybrid On-Chain/Off-Chain System**

- **On-Chain**: Credential registry with Merkle root hashes (zero personal data)
- **Off-Chain**: Full credentials stored in browser localStorage
- **Issuers**: Universities/institutions with mandatory blockchain wallets
- **Users**: Optional wallet, identified by wallet address OR email hash

## Tech Stack

**Backend**
- Deno 2.x + Oak framework
- PostgreSQL 16
- ethers.js v6.13

**Blockchain**
- Avalanche (local: Anvil)
- Solidity + Foundry
- CredentialRegistry smart contract

**Frontend**
- Next.js 15 + React 19
- TypeScript

## Quick Start

### 1. Database

```bash
createdb ownid
psql ownid < back-end/db/schema.sql
```

### 2. Smart Contract

```bash
cd contracts
anvil  # Terminal 1

# Terminal 2
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast
forge test -vv
```

### 3. Backend

```bash
cd back-end

cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/ownid
JWT_SECRET=your-secret-key
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EOF

deno task dev  # http://localhost:8000
```

### 4. Frontend

```bash
cd front-end
npm install
npm run dev  # http://localhost:3000
```

## API Endpoints

### Issuer

```bash
# Register
POST /api/issuer/register
{
  "name": "Università Tor Vergata",
  "email": "admin@uniroma2.it",
  "password": "password"
}

# Login
POST /api/issuer/login
```

### Admin

```bash
# List pending issuers
GET /api/admin/issuers/pending

# Approve (registers on-chain)
POST /api/admin/issuers/:id/approve

# Revoke
POST /api/admin/issuers/:id/revoke
```

### Credentials

```bash
# Issue credential
POST /api/credentials/issue
Authorization: Bearer ISSUER_JWT
{
  "userId": "uuid",
  "credentialType": "signedUniversity",
  "claims": {
    "isStudent": true,
    "university": "Tor Vergata",
    "faculty": "Engineering"
  }
}

# List available
GET /api/credentials/available
Authorization: Bearer USER_JWT

# Claim credential
POST /api/credentials/claim/:id
Authorization: Bearer USER_JWT

# Verify (public)
GET /api/credentials/verify/:claimId
```

## Database Schema

```sql
-- Issuers: auto-generated wallet, requires admin approval
CREATE TABLE issuers (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    wallet_private_key TEXT NOT NULL,
    approved BOOLEAN DEFAULT false
);

-- Users: optional wallet
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    wallet_address TEXT  -- NULL allowed
);

-- Claim metadata only (no full credentials)
CREATE TABLE claim_notifications (
    user_id TEXT NOT NULL,
    user_identifier TEXT NOT NULL,  -- wallet OR hash(email)
    claim_id TEXT NOT NULL,
    tx_hash TEXT
);
```

## Smart Contract

```solidity
// Admin
addIssuer(string name, address wallet)
revokeIssuer(uint256 issuerId)

// Issuer
registerClaim(address user, string type, bytes32 merkleRoot, uint256 expires, bytes sig)
revokeClaim(bytes32 claimId, bytes sig)

// Public
isClaimValid(bytes32 claimId) returns (bool)
```

## Credential Flow

1. **Issuer Registration**
   - System generates wallet
   - Status: `approved = false`

2. **Admin Approval**
   - Database: `approved = true`
   - Blockchain: `addIssuer()`

3. **Credential Issuance**
   - Generate identifier: wallet OR `keccak256(email)`
   - Create Merkle tree from claims
   - Sign with issuer wallet
   - Register on-chain (Merkle root only)
   - Generate W3C credential
   - Notify user

4. **User Claims**
   - View available credentials
   - Mark as claimed
   - Receive full JSON

5. **Verification**
   - Public endpoint checks on-chain
   - Returns metadata only

## Privacy

**On-Chain (Public)**
- Merkle root hash
- User identifier (wallet OR email hash)
- Issuer ID
- Timestamps

**Off-Chain (Private)**
- Full claims in localStorage
- Personal data never on blockchain
- Selective disclosure via Merkle proofs

## Testing

```bash
# Smart contracts
cd contracts && forge test -vv

# Services
cd back-end && deno test services/user-identifier.test.ts
```

## Project Structure

```
back-end/
├── routes/
│   ├── admin.ts         # Admin approval/revoke
│   ├── issuer.ts        # Issuer registration
│   ├── credentials.ts   # Credential issuance
│   └── auth.ts          # User authentication
├── services/
│   ├── blockchain.ts    # Smart contract interaction
│   ├── user-identifier.ts  # Hybrid identifier
│   └── merkle.ts        # Merkle tree generator
└── db/schema.sql

contracts/
├── src/CredentialRegistry.sol
└── test/CredentialRegistry.t.sol

front-end/
└── app/                 # Next.js 15 App Router
```

## Security Notes

**Current Implementation (Development)**
- Wallet private keys in database
- Admin auth accepts any valid JWT
- Local blockchain only

**Production Requirements**
- Encrypt wallet private keys (KMS)
- Role-based authentication
- Rate limiting
- HTTPS enforcement
- Input sanitization

## License

MIT
