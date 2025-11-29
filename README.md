# OwnID

Identity Provider decentralizzato basato su Avalanche blockchain.

## Panoramica

OwnID è un sistema di gestione dell'identità digitale che utilizza la blockchain Avalanche per garantire sicurezza, trasparenza e controllo dell'utente sui propri dati. Il progetto è stato sviluppato per un hackathon e include un backend API costruito con Deno e un frontend moderno con Next.js.

## Caratteristiche

- ✅ Autenticazione JWT sicura
- ✅ Registrazione e login utenti
- ✅ Gestione profilo utente
- ✅ Persistenza dati con PostgreSQL
- ✅ **Integrazione Blockchain**: Badge NFT soulbound per certificati
- ✅ **Smart Contracts**: Emissione e verifica certificati su blockchain
- ✅ API REST per interazione con blockchain
- ✅ Interfaccia utente moderna e responsive
- ✅ Architettura modulare e scalabile

## Stack Tecnologico

### Backend
- **Runtime**: Deno 2.x
- **Framework**: Oak 17.x
- **Database**: PostgreSQL 16
- **Autenticazione**: JWT (djwt)
- **Blockchain**: ethers.js v6.13.0 per interazione con smart contract
- **Password Hashing**: SHA-256 (temporaneo, da migrare a bcrypt/argon2)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode
- **Package Manager**: pnpm

### Smart Contracts
- **Framework**: Foundry (Forge, Cast, Anvil)
- **Linguaggio**: Solidity
- **Contratto Principale**: PublicBadgeNetwork.sol - Badge NFT ERC721 soulbound
- **Dipendenze**: OpenZeppelin Contracts
- **Testing**: Anvil (blockchain locale) / Avalanche Subnet

## Prerequisiti

- [Deno](https://deno.land/) v2.x o superiore
- [Node.js](https://nodejs.org/) v18+ e pnpm
- [Docker](https://www.docker.com/) e Docker Compose
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (per sviluppo smart contracts)
- PostgreSQL 16 (opzionale se si usa Docker)

## Quick Start (con Blockchain)

Per testare rapidamente l'intero sistema incluse le funzionalità blockchain:

```bash
# 1. Avvia database
docker-compose up -d

# 2. Avvia blockchain locale (terminale 1)
cd contracts && anvil

# 3. Avvia backend (terminale 2)
cd back-end && deno task dev

# 4. Avvia frontend (terminale 3)
cd front-end && pnpm install && pnpm dev

# 5. Testa API blockchain (terminale 4)
cd back-end && ./test-blockchain-api.sh
```

Accedi a:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8000
- ⛓️ Blockchain RPC: http://localhost:8545

## Installazione

### 1. Clona il repository

```bash
git clone <repository-url>
cd ownid
```

### 2. Avvia il database

```bash
docker-compose up -d
```

Questo avvierà PostgreSQL in un container Docker. Il database sarà disponibile su `localhost:5432`.

**Credenziali database (development)**:
- Database: `ownid`
- User: `ownid_user`
- Password: `ownid_password_dev`

### 3. Backend Setup

```bash
cd back-end
deno task dev
```

Il backend sarà disponibile su `http://localhost:8000`.

### 4. Frontend Setup

In una nuova finestra del terminale:

```bash
cd front-end
pnpm install
pnpm dev
```

Il frontend sarà disponibile su `http://localhost:3000`.

### 5. Blockchain Setup (Opzionale - per funzionalità blockchain)

Per abilitare le funzionalità blockchain, avvia una blockchain locale con Anvil:

```bash
# In una nuova finestra del terminale
cd contracts
anvil
```

Anvil avvierà una blockchain locale su `http://localhost:8545`.

**Deploy del contratto (se necessario):**

```bash
# In un altro terminale
cd contracts
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

Il contratto è già deployato all'indirizzo: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

**Test delle API blockchain:**

```bash
cd back-end
./test-blockchain-api.sh
```

## Utilizzo

### Registrazione

1. Vai su `http://localhost:3000/registrati`
2. Compila il form con nome, cognome, email e password
3. Clicca su "Registrati"
4. Verrai reindirizzato alla dashboard

### Login

1. Vai su `http://localhost:3000/login`
2. Inserisci email e password
3. Clicca su "Accedi"
4. Verrai reindirizzato alla dashboard

## API Endpoints

### Health Check
```http
GET http://localhost:8000/
```

Ritorna lo stato del server.

### Autenticazione

#### Registrazione
```http
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario@example.com",
  "password": "password123"
}
```

#### Login
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "mario@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST http://localhost:8000/api/auth/logout
Authorization: Bearer <token>
```

### Profilo Utente

#### Ottieni Profilo
```http
GET http://localhost:8000/api/user/profile
Authorization: Bearer <token>
```

#### Aggiorna Profilo
```http
PUT http://localhost:8000/api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Mario",
  "cognome": "Verdi"
}
```

### Blockchain

Le API blockchain permettono di emettere e verificare badge/certificati su blockchain.

#### Test Connessione Blockchain
```http
GET http://localhost:8000/api/blockchain/test
```

#### Registra Ente
```http
POST http://localhost:8000/api/blockchain/register-entity
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Università di Bologna",
  "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}
```

#### Emetti Badge
```http
POST http://localhost:8000/api/blockchain/issue-badge
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "title": "Laurea in Informatica",
  "specialization": "Blockchain Development",
  "daysValid": 365,
  "privateData": "Voto: 110/110 con lode",
  "entityPrivateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}
```

#### Ottieni Badge
```http
GET http://localhost:8000/api/blockchain/badge/1
```

#### Verifica Dati Privati
```http
POST http://localhost:8000/api/blockchain/verify/1
Content-Type: application/json

{
  "privateData": "Voto: 110/110 con lode"
}
```

📖 **Documentazione completa**: [back-end/BLOCKCHAIN_API.md](back-end/BLOCKCHAIN_API.md)

## Struttura del Progetto

```
ownid/
├── back-end/                    # Backend API (Deno + Oak)
│   ├── main.ts                 # Entry point del server
│   ├── deno.json               # Configurazione Deno
│   ├── routes/                 # Route handlers
│   │   ├── index.ts            # Router principale
│   │   ├── auth.ts             # Autenticazione
│   │   ├── user.ts             # Gestione utenti
│   │   └── blockchain.ts       # API blockchain
│   ├── services/               # Servizi
│   │   └── blockchain.ts       # Interazione con smart contract (ethers.js)
│   ├── contracts/              # ABI smart contracts
│   │   └── PublicBadgeNetwork.abi.json
│   ├── db/                     # Database
│   │   ├── connection.ts       # Pool di connessioni PostgreSQL
│   │   └── schema.sql          # Schema database
│   ├── test-blockchain-api.sh  # Script test API blockchain
│   └── BLOCKCHAIN_API.md       # Documentazione API blockchain
│
├── front-end/                  # Frontend (Next.js)
│   ├── app/                    # App Router
│   │   ├── components/         # Componenti riutilizzabili
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── login/              # Pagina login
│   │   ├── registrati/         # Pagina registrazione
│   │   └── dashboard/          # Dashboard utente
│   ├── package.json            # Dipendenze frontend
│   └── tsconfig.json           # Configurazione TypeScript
│
├── contracts/                  # Smart Contracts (Foundry)
│   ├── src/                    # Sorgenti Solidity
│   │   └── PublicBadgeNetwork.sol  # Contratto principale
│   ├── script/                 # Script di deploy
│   │   └── DeployPublicBadgeNetwork.s.sol
│   ├── test/                   # Test Solidity
│   ├── lib/                    # Dipendenze (OpenZeppelin, forge-std)
│   ├── foundry.toml            # Configurazione Foundry
│   ├── test-contract.sh        # Script test contratto
│   └── DEPLOY.md               # Guida deployment
│
├── docker-compose.yaml         # Configurazione Docker per PostgreSQL
├── BLOCKCHAIN_INTEGRATION.md   # Guida integrazione blockchain
└── README.md                   # Questo file
```

## Sviluppo

### Backend

```bash
# Development mode (con auto-reload)
cd back-end
deno task dev

# Production mode
deno task start
```

### Frontend

```bash
cd front-end

# Development server
pnpm dev

# Build per produzione
pnpm build

# Avvia server produzione
pnpm start

# Linting
pnpm lint
```

### Database

```bash
# Avvia PostgreSQL
docker-compose up -d

# Ferma PostgreSQL
docker-compose down

# Visualizza logs
docker-compose logs -f postgres

# Rimuovi volume (reset database)
docker-compose down -v
```

### Smart Contracts

```bash
cd contracts

# Compila i contratti
forge build

# Esegui test Solidity
forge test

# Esegui test con verbosità
forge test -vvv

# Avvia blockchain locale Anvil
anvil

# Deploy su blockchain locale
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

# Test contratto con script
./test-contract.sh

# Interagisci con il contratto
./interact.sh
```

## Variabili d'Ambiente

### Backend (`back-end/.env`)

```env
# Server
PORT=8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://ownid_user:ownid_password_dev@localhost:5432/ownid

# Autenticazione
JWT_SECRET=<your-secret-key>

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=<optional-for-server-side-transactions>
```

## Architettura Blockchain

Il sistema utilizza smart contract sulla blockchain per gestire badge/certificati digitali verificabili:

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
│ Network (ERC721)│
└─────────────────┘
```

### Funzionalità Smart Contract

**PublicBadgeNetwork.sol** implementa:

- ✅ **Badge NFT Soulbound**: Certificati non trasferibili legati all'indirizzo del destinatario
- ✅ **Registrazione Enti**: Università/istituzioni possono registrarsi per emettere badge
- ✅ **Emissione Badge**: Gli enti registrati possono emettere certificati con dati pubblici e privati
- ✅ **Verifica Privacy**: I dati privati sono hashati on-chain, verificabili senza rivelarli
- ✅ **Scadenza Certificati**: Supporto per certificati temporanei o permanenti
- ✅ **Revoca**: Possibilità di revocare certificati emessi erroneamente

📖 **Documentazione completa**: [BLOCKCHAIN_INTEGRATION.md](BLOCKCHAIN_INTEGRATION.md)

## Roadmap

### Completato ✅

- [x] Integrazione blockchain con Foundry e Anvil
- [x] Smart contract PublicBadgeNetwork per badge NFT soulbound
- [x] API REST per interazione con blockchain
- [x] Sistema di emissione e verifica certificati on-chain
- [x] Registrazione enti emittenti
- [x] Test completi per smart contract e API

### In Sviluppo 🚧

- [ ] Frontend per funzionalità blockchain
- [ ] Deploy su Avalanche subnet (attualmente su Anvil locale)
- [ ] Integrazione wallet (MetaMask, WalletConnect)

### Pianificato 📋

- [ ] Implementare bcrypt/argon2 per password hashing
- [ ] Aggiungere rate limiting
- [ ] Email verification
- [ ] Password reset
- [ ] Autenticazione a due fattori (2FA)
- [ ] Gestione permessi e ruoli
- [ ] Dashboard amministratore
- [ ] Notifiche badge emessi
- [ ] Visualizzazione portfolio badge

## Sicurezza

⚠️ **Nota Importante**: Questa è una versione sviluppata per un hackathon. Per l'uso in produzione:

### Autenticazione e Database
- Implementare bcrypt o argon2 per l'hashing delle password (attualmente SHA-256)
- Caricare JWT_SECRET da variabili d'ambiente invece di generarlo a runtime
- Implementare rate limiting per prevenire attacchi brute force
- Abilitare HTTPS
- Validare accuratamente tutti gli input utente
- Implementare logging e monitoring adeguati
- Usare credenziali database sicure (non quelle di default)

### Blockchain
- ⚠️ **NON inviare chiavi private dal client**: In produzione usare WalletConnect o MetaMask
- Le chiavi private hardcoded negli script sono **SOLO per sviluppo locale** con Anvil
- Verificare sempre l'indirizzo del contratto prima di interagire
- Implementare gestione nonce per transazioni concorrenti
- Validare tutti i parametri prima di chiamare funzioni del contratto
- Considerare gas limits appropriati per ogni transazione
- Implementare eventi on-chain per tracking e audit trail
- Per production su Avalanche subnet, usare chiavi private gestite in modo sicuro (HSM, KMS)

## Contributi

Questo progetto è stato sviluppato per un hackathon. Contributi, suggerimenti e feedback sono benvenuti!

## Licenza

[Specifica la licenza del progetto]

## Contatti

[Aggiungi informazioni di contatto se necessario]
