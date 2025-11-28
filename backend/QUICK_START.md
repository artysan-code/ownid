# 🚀 OwnID Backend - Quick Start

## Setup in 3 Minuti

### 1. Setup Environment

```bash
# Copia .env
cp .env.example .env

# Modifica il JWT_SECRET (IMPORTANTE!)
sed -i 's/your-super-secret-jwt-key-change-this-in-production/your-actual-secret-key-here/' .env
```

### 2. Avvia Database

```bash
docker-compose up -d
```

### 3. Avvia Server

```bash
go run cmd/server/main.go
```

✅ Server running su `http://localhost:8080`

---

## Test Rapido

```bash
# Health check
curl http://localhost:8080/health

# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## Comandi Utili

```bash
# Build
make build

# Run
make run

# Stop database
make docker-down

# Show logs
make docker-logs

# Clean
make clean

# Full dev setup (database + server)
make dev
```

---

## Struttura URL

- Health: `GET /health`
- Register: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Me: `GET /api/v1/auth/me` (protected)
- OAuth Authorize: `POST /api/v1/oauth/authorize`
- Verify ZK: `POST /api/v1/auth/verify-with-zk`
- Verifications: `GET /api/v1/verifications` (protected)

---

## Prossimi Step

1. Deploy smart contracts su Avalanche Fuji
2. Aggiorna `.env` con gli indirizzi dei contratti
3. Genera Go bindings con `abigen`
4. Testa verifica on-chain
