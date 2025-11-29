# Integrazione Blockchain Completata! 🎉

Il contratto PublicBadgeNetwork è stato integrato con successo nel backend OwnID.

## Cosa è stato fatto

### 1. Contratto Smart Contract ✅
- **File**: [contracts/src/PublicBadgeNetwork.sol](contracts/src/PublicBadgeNetwork.sol)
- **Funzionalità**: Badge NFT soulbound (non trasferibili) per certificati
- **Deploy locale**: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (Anvil)

### 2. Backend Integration ✅
- **Servizio Blockchain**: [back-end/services/blockchain.ts](back-end/services/blockchain.ts)
- **Route API**: [back-end/routes/blockchain.ts](back-end/routes/blockchain.ts)
- **Documentazione API**: [back-end/BLOCKCHAIN_API.md](back-end/BLOCKCHAIN_API.md)

### 3. Script di Test ✅
- **Test Contratto**: [contracts/test-contract.sh](contracts/test-contract.sh)
- **Test API**: [back-end/test-blockchain-api.sh](back-end/test-blockchain-api.sh)
- **Script Interattivo**: [contracts/interact.sh](contracts/interact.sh)

## Come Testare l'Integrazione Completa

### Passo 1: Avvia Anvil (Blockchain Locale)

```bash
# Terminale 1
cd contracts
anvil
```

Questo avvierà una blockchain locale sulla porta 8545.

### Passo 2: Il contratto è già deployato

Il contratto è già stato deployato all'indirizzo:
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Se vuoi re-deployarlo:
```bash
# Terminale 2
cd contracts
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### Passo 3: Avvia il Backend

```bash
# Terminale 3
cd back-end
deno task dev
```

Dovresti vedere:
```
🔌 Testing database connection...
✅ Database connected
⛓️  Testing blockchain connection...
✅ Blockchain connected - Block: 1
   Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🦕 OwnID Backend running on http://localhost:8000
```

### Passo 4: Testa le API Blockchain

```bash
# Terminale 4
cd back-end
./test-blockchain-api.sh
```

Questo script testerà automaticamente:
1. ✅ Connessione blockchain
2. ✅ Registrazione di un ente
3. ✅ Emissione di un badge
4. ✅ Lettura informazioni badge
5. ✅ Verifica dati privati
6. ✅ Query enti e utenti

## API Endpoints Disponibili

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/blockchain/test` | Test connessione |
| POST | `/api/blockchain/register-entity` | Registra ente |
| POST | `/api/blockchain/issue-badge` | Emetti badge |
| GET | `/api/blockchain/badge/:id` | Info badge |
| POST | `/api/blockchain/verify/:id` | Verifica dati privati |
| GET | `/api/blockchain/entity/:id` | Info ente |
| GET | `/api/blockchain/entity/wallet/:address` | EntityId da wallet |
| GET | `/api/blockchain/user/:address/badges` | Badge utente |

Vedi [back-end/BLOCKCHAIN_API.md](back-end/BLOCKCHAIN_API.md) per la documentazione completa.

## Test Diretti con curl

### Test Connessione
```bash
curl http://localhost:8000/api/blockchain/test
```

### Ottieni Badge
```bash
curl http://localhost:8000/api/blockchain/badge/1
```

### Verifica Dati Privati
```bash
curl -X POST http://localhost:8000/api/blockchain/verify/1 \
  -H "Content-Type: application/json" \
  -d '{"privateData": "Voto: 110/110 con lode"}'
```

## Configurazione

### Backend (.env)
```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Per deploy sulla Subnet Avalanche

Quando la subnet sarà operativa:

1. Aggiorna il file `contracts/.env`:
```env
FUJI_RPC_URL=https://nodes-prod.18.182.4.86.sslip.io/ext/bc/SNwHQCqEdEjNRfrowGGuxYmanVTijcRxvrXaJzJSaMGsioUci/rpc
```

2. Deploy sulla subnet:
```bash
cd contracts
rm -rf broadcast/ cache/
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

3. Aggiorna `back-end/.env` con il nuovo indirizzo del contratto

## Architettura

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Backend       │      │   PostgreSQL     │
│   (Deno + Oak)  │◄────►│   Database       │
└────────┬────────┘      └──────────────────┘
         │
         │ ethers.js
         ▼
┌─────────────────┐
│   Blockchain    │
│   (Anvil/Avax)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Smart Contract  │
│ PublicBadge     │
│ Network         │
└─────────────────┘
```

## Funzionalità Smart Contract

### PublicBadgeNetwork.sol

**Registrazione Enti**
```solidity
function registerAsEntity(string memory _name) external
```
- Gli enti possono registrarsi per emettere badge
- Ogni wallet può registrarsi una sola volta
- I nomi devono essere unici

**Emissione Badge**
```solidity
function issueBadge(
  address _student,
  string memory _title,
  string memory _spec,
  uint256 _daysValid,
  string memory _privateData
) external
```
- Solo enti registrati possono emettere badge
- I badge sono NFT soulbound (non trasferibili)
- Supporta scadenza (0 = permanente)
- Dati privati sono hashati on-chain

**Lettura Informazioni**
```solidity
function getBadgeInfo(uint256 certId) external view returns (...)
```
- Informazioni pubbliche: issuer, titolo, specializzazione, stato, data
- Lo stato può essere: "Valido", "Scaduto", "Revocato"

**Verifica Privacy**
```solidity
function verifyPrivateData(uint256 certId, string memory _dataToCheck) external view returns (bool)
```
- Verifica dati privati senza rivelarli on-chain
- Usa hash per confronto

## Prossimi Passi

### 1. Integrare nel Frontend
Crea un servizio in Next.js per chiamare le API:
```typescript
// front-end/services/blockchain.ts
export async function getBadge(badgeId: number) {
  const response = await fetch(`/api/blockchain/badge/${badgeId}`);
  return response.json();
}
```

### 2. Aggiungere Wallet Connect
Invece di inviare chiavi private, usa WalletConnect o MetaMask:
- L'utente firma le transazioni dal proprio wallet
- Più sicuro per produzione

### 3. Ottimizzazioni
- Caching delle chiamate blockchain
- Indexing degli eventi per query veloci
- Notifiche in tempo reale per nuovi badge

### 4. Deploy Subnet
- Attendere che la subnet sia operativa (block number > 0)
- Fare deploy del contratto
- Aggiornare configurazione backend

## Troubleshooting

### Blockchain non connessa
```
⚠️  Blockchain connection failed: could not detect network
```
**Soluzione**: Assicurati che Anvil sia in esecuzione

### Errore "Wallet non registrato come ente"
**Soluzione**: Prima registra l'ente con `/api/blockchain/register-entity`

### Token JWT non valido
**Soluzione**: Fai login su `/api/auth/login` per ottenere un nuovo token

## File Creati

```
back-end/
├── services/
│   └── blockchain.ts          # Servizio per interagire con il contratto
├── routes/
│   └── blockchain.ts          # API endpoints blockchain
├── contracts/
│   └── PublicBadgeNetwork.abi.json  # ABI del contratto
├── BLOCKCHAIN_API.md          # Documentazione API
└── test-blockchain-api.sh     # Script di test API

contracts/
├── src/
│   └── PublicBadgeNetwork.sol # Smart contract
├── script/
│   └── DeployPublicBadgeNetwork.s.sol  # Script di deploy
├── test-contract.sh           # Test completo contratto
├── interact.sh                # Script interattivo
└── DEPLOY.md                  # Guida al deploy
```

## Supporto

Per problemi o domande:
1. Controlla i log di Anvil e del backend
2. Verifica le configurazioni in `.env`
3. Consulta la documentazione API in `back-end/BLOCKCHAIN_API.md`
4. Testa con gli script forniti

---

**Tutto è pronto per l'uso! 🚀**
