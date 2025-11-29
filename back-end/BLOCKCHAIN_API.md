# Blockchain API Documentation

API endpoints per interagire con il contratto PublicBadgeNetwork sulla blockchain.

## Configurazione

Aggiungi queste variabili al file `.env`:

```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=optional_for_server_side_transactions
```

## Endpoints

### Test Connessione

**GET** `/api/blockchain/test`

Testa la connessione alla blockchain.

**Response:**
```json
{
  "connected": true,
  "blockNumber": 123,
  "contractAddress": "0x...",
  "rpcUrl": "http://localhost:8545"
}
```

---

### Registra Ente

**POST** `/api/blockchain/register-entity`

Registra un nuovo ente che può emettere badge.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "name": "Università di Bologna",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ente registrato con successo",
  "data": {
    "txHash": "0x...",
    "entityId": "1",
    "name": "Università di Bologna"
  }
}
```

---

### Emetti Badge

**POST** `/api/blockchain/issue-badge`

Emette un badge/certificato a uno studente.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "studentAddress": "0x...",
  "title": "Laurea in Informatica",
  "specialization": "Blockchain Development",
  "daysValid": 365,
  "privateData": "Voto: 110/110",
  "entityPrivateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Badge emesso con successo",
  "data": {
    "txHash": "0x...",
    "badgeId": "1",
    "entityId": "1",
    "recipient": "0x..."
  }
}
```

---

### Ottieni Badge

**GET** `/api/blockchain/badge/:id`

Ottiene le informazioni pubbliche di un badge.

**Response:**
```json
{
  "success": true,
  "data": {
    "badgeId": 1,
    "issuerName": "Università di Bologna",
    "title": "Laurea in Informatica",
    "specialization": "Blockchain Development",
    "status": "Valido",
    "issueDate": "2025-11-28T12:00:00.000Z"
  }
}
```

---

### Verifica Dati Privati

**POST** `/api/blockchain/verify/:id`

Verifica se i dati privati forniti corrispondono a quelli hashati nel badge.

**Body:**
```json
{
  "privateData": "Voto: 110/110"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true
}
```

---

### Ottieni Informazioni Ente

**GET** `/api/blockchain/entity/:id`

Ottiene le informazioni di un ente registrato.

**Response:**
```json
{
  "success": true,
  "data": {
    "entityId": 1,
    "name": "Università di Bologna",
    "wallet": "0x..."
  }
}
```

---

### Ottieni Entity ID da Wallet

**GET** `/api/blockchain/entity/wallet/:address`

Verifica se un wallet è registrato come ente.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "entityId": 1,
    "isEntity": true
  }
}
```

---

### Ottieni Badge Utente

**GET** `/api/blockchain/user/:address/badges`

Ottiene il numero di badge posseduti da un utente.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "badgeCount": 3
  }
}
```

---

## Esempi di Utilizzo

### Test Connessione
```bash
curl http://localhost:8000/api/blockchain/test
```

### Registra Ente
```bash
curl -X POST http://localhost:8000/api/blockchain/register-entity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Università di Bologna",
    "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  }'
```

### Emetti Badge
```bash
curl -X POST http://localhost:8000/api/blockchain/issue-badge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "title": "Laurea in Informatica",
    "specialization": "Blockchain Development",
    "daysValid": 365,
    "privateData": "Voto: 110/110",
    "entityPrivateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  }'
```

### Ottieni Badge
```bash
curl http://localhost:8000/api/blockchain/badge/1
```

### Verifica Dati Privati
```bash
curl -X POST http://localhost:8000/api/blockchain/verify/1 \
  -H "Content-Type: application/json" \
  -d '{"privateData": "Voto: 110/110"}'
```

## Note di Sicurezza

⚠️ **IMPORTANTE**:
- Le chiavi private devono essere inviate dal client in modo sicuro
- In produzione, considera di usare wallet connect o simili invece di inviare chiavi private
- Il backend può essere configurato per usare una chiave privata server-side per alcune operazioni
- Implementa rate limiting per prevenire abusi
- Valida sempre l'autenticazione JWT prima di operazioni sensibili

## Integrazione con il Frontend

Nel frontend Next.js, puoi creare un servizio per interagire con queste API:

```typescript
// services/blockchain.ts
export async function registerEntity(name: string, privateKey: string, token: string) {
  const response = await fetch('/api/blockchain/register-entity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, privateKey })
  });
  return response.json();
}

export async function getBadge(badgeId: number) {
  const response = await fetch(`/api/blockchain/badge/${badgeId}`);
  return response.json();
}

// ... altre funzioni
```
