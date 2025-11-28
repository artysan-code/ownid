# OwnID Backend

Backend API per il sistema di identità Zero-Knowledge con integrazione Avalanche.

## 🚀 Quick Start

### Prerequisiti

- Go 1.21+
- Docker & Docker Compose
- Make (opzionale)

### Setup

1. **Clona e installa dipendenze**

```bash
cd backend
go mod download
```

2. **Configura variabili d'ambiente**

```bash
cp .env.example .env
# Modifica .env con i tuoi valori
```

3. **Avvia i servizi Docker (PostgreSQL + Redis)**

```bash
make docker-up
# oppure
docker-compose up -d
```

4. **Avvia il server**

```bash
make run
# oppure
go run cmd/server/main.go
```

Il server sarà disponibile su `http://localhost:8080`

## 📁 Struttura

```
backend/
├── cmd/
│   └── server/          # Entry point
│       └── main.go
├── internal/
│   ├── auth/            # JWT e password hashing
│   ├── avalanche/       # Client Avalanche
│   ├── config/          # Configurazione
│   ├── db/              # Database queries
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # Middleware (auth, CORS)
│   └── models/          # Data models
├── pkg/
│   └── utils/           # Utilities (Redis client)
├── .env.example
├── docker-compose.yml
├── go.mod
├── Makefile
└── README.md
```

## 🔌 API Endpoints

### Health Check

```bash
GET /health
```

### Auth (Public)

```bash
# Registrazione
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Verifica con ZK Proof
POST /api/v1/auth/verify-with-zk
{
  "email": "user@example.com",
  "password": "password123",
  "auth_code": "abc123...",
  "proof": {
    "a": ["123", "456"],
    "b": [["789", "012"], ["345", "678"]],
    "c": ["901", "234"],
    "publicInputs": ["18"]
  },
  "credential_hash": "0xabc...",
  "issuer_address": "0x123..."
}
```

### Auth (Protected)

```bash
# Get current user
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
```

### OAuth

```bash
# Authorize
POST /api/v1/oauth/authorize
{
  "client_id": "netflix.com",
  "redirect_uri": "https://netflix.com/callback",
  "scope": "age_verified",
  "state": "random-state"
}
```

### Verifications (Protected)

```bash
# Get user verifications
GET /api/v1/verifications
Headers: Authorization: Bearer <token>
```

## 🗄️ Database Schema

Il database viene inizializzato automaticamente all'avvio.

**Tabelle:**
- `users` - Utenti registrati
- `oauth_clients` - Client OAuth registrati
- `oauth_sessions` - Sessioni OAuth attive
- `verification_logs` - Log delle verifiche ZK

## ⚙️ Configurazione Avalanche

Dopo aver deployato i contratti su Avalanche Fuji, aggiorna il `.env`:

```env
AVALANCHE_PRIVATE_KEY=your-private-key
ISSUER_REGISTRY_ADDRESS=0x...
CREDENTIAL_REGISTRY_ADDRESS=0x...
PROOF_VERIFIER_ADDRESS=0x...
```

## 🧪 Testing

```bash
# Unit tests
make test

# Test con curl
curl http://localhost:8080/health
```

## 📦 Comandi Make

```bash
make help          # Mostra tutti i comandi
make build         # Compila il binario
make run           # Avvia il server
make test          # Esegue i test
make docker-up     # Avvia PostgreSQL e Redis
make docker-down   # Ferma i container
make dev           # Avvia tutto (docker + server)
```

## 🔐 Sicurezza

- Password hashate con bcrypt (cost 12)
- JWT con HS256
- Validazione input su tutti gli endpoint
- CORS configurato
- Auth codes one-time use (Redis)

## 🐛 Troubleshooting

### "Failed to connect to database"
Verifica che PostgreSQL sia in esecuzione:
```bash
docker-compose ps
```

### "Invalid JWT secret"
Assicurati di aver impostato `JWT_SECRET` nel `.env`

### "Avalanche client not configured"
Completa tutte le variabili `AVALANCHE_*` nel `.env`

## 📝 TODO

- [ ] Implementare bindings Go per i contratti (abigen)
- [ ] Aggiungere rate limiting
- [ ] Implementare refresh tokens
- [ ] Aggiungere metriche (Prometheus)
- [ ] Aggiungere logging strutturato (zerolog)

## 📄 License

MIT
