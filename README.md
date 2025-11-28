# OwnID - Zero-Knowledge Identity Protocol

Sistema di identità decentralizzata con Zero-Knowledge Proofs su Avalanche.

---

## 🎯 Obiettivo

Permettere agli utenti di **dimostrare attributi** (es. "ho più di 18 anni") **senza rivelare i dati personali** (es. la data di nascita esatta).

---

## 🏗️ Architettura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ISSUER    │     │    USER     │     │  VERIFIER   │
│  (Governo,  │     │  (Persona)  │     │   (Sito,    │
│   Banche)   │     │             │     │   Servizio) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Emette         │                   │
       │    Credential     │                   │
       │ ─────────────────>│                   │
       │                   │                   │
       │                   │ 2. Genera ZK Proof│
       │                   │    (locale)       │
       │                   │                   │
       │                   │ 3. Invia Proof    │
       │                   │ ─────────────────>│
       │                   │                   │
       │                   │                   │ 4. Verifica
       │                   │                   │    Proof
       │                   │                   │
```

---

## 📦 Componenti

### `/contracts` - Smart Contracts (Solidity)

**Scopo:** Gestire on-chain la fiducia e lo stato delle credenziali.

**Contratti da implementare:**

1. **IssuerRegistry.sol**
   - Registro degli issuer autorizzati
   - Solo il proprietario può aggiungere/rimuovere issuer
   - Mappa: `address issuer => bool isAuthorized`
   - Ogni issuer ha tipi di credenziali che può emettere

2. **CredentialRegistry.sol**
   - NON salva dati personali (solo hash)
   - Traccia revoche di credenziali
   - Mappa: `bytes32 credentialHash => bool isRevoked`
   - Permette di verificare se una credenziale è stata revocata

**Domande aperte:**
- Serve verificare le ZK proof on-chain o basta off-chain?
- Come gestire la scadenza delle credenziali?

---

### `/backend` - API Server (Go + Fiber)

**Scopo:** Orchestrare il flusso di emissione e verifica.

**Servizi da implementare:**

1. **Issuer Service**
   - Endpoint per richiedere una credenziale
   - Firma le credenziali con chiave privata dell'issuer
   - In produzione: integrazione con sistemi reali (SPID, banche)
   - Per demo: emissione simulata

2. **Verifier Service**
   - Genera richieste di verifica (cosa deve dimostrare l'utente)
   - Crea QR code con i parametri della richiesta
   - Verifica le ZK proof ricevute
   - Controlla che l'issuer sia autorizzato (chiama smart contract)
   - Controlla che la credenziale non sia revocata

3. **Proof Service** (opzionale, può essere client-side)
   - Genera ZK proof a partire da una credenziale
   - Usa libreria ZK (snarkjs, circom, o simile)

**Domande aperte:**
- Quale libreria ZK usare? (snarkjs è JS, potremmo usare gnark per Go)
- Come strutturare il circuito ZK?

---

### `/frontend` - Web App (Next.js)

**Scopo:** Interfaccia utente per tutti i ruoli.

**Pagine da implementare:**

1. **Landing Page** (`/`)
   - Spiega cos'è OwnID
   - Call to action per connettere wallet

2. **Wallet/Dashboard** (`/wallet`)
   - Lista delle credenziali dell'utente (salvate in localStorage)
   - Possibilità di vedere i dettagli
   - Possibilità di eliminare credenziali

3. **Ottieni Credenziale** (`/issuer`)
   - Demo: simula richiesta a un issuer
   - Utente riceve credenziale firmata
   - Credenziale salvata nel browser

4. **Verifica Identità** (`/verify`)
   - **Vista Verifier:** Genera QR code con richiesta
   - **Vista User:** Scansiona QR, seleziona credenziale, genera proof, invia

**Domande aperte:**
- Generare ZK proof nel browser o nel backend?
- Come gestire wallet multipli?

---

## 🔐 Flusso Dettagliato

### Fase 1: Emissione Credenziale

```
1. User si autentica con Issuer (es. SPID)
2. Issuer verifica identità reale
3. Issuer crea Credential JSON:
   {
     "id": "uuid",
     "type": "AgeCredential",
     "subject": "0xUserWallet",
     "issuer": "0xIssuerWallet",
     "claims": { "birthDate": "1990-01-15" },
     "issuedAt": "2024-01-01",
     "expiresAt": "2025-01-01"
   }
4. Issuer firma con sua chiave privata
5. User riceve e salva la credential (locale, NON on-chain)
```

### Fase 2: Verifica con ZK Proof

```
1. Verifier crea richiesta: "Dimostra età >= 18"
2. Verifier mostra QR code con parametri
3. User scansiona QR
4. User seleziona AgeCredential dal wallet locale
5. App genera ZK Proof:
   - Input privato: birthDate dalla credential
   - Input pubblico: soglia (18), data odierna
   - Output: proof che birthDate implica età >= 18
6. User invia proof al Verifier
7. Verifier verifica:
   a. Proof matematicamente valida
   b. Firma dell'issuer valida
   c. Issuer è nel registry on-chain
   d. Credential non revocata on-chain
8. Verifier approva/rifiuta
```

---

## 🛠️ Stack Tecnologico

| Componente | Tecnologia | Motivazione |
|------------|------------|-------------|
| Blockchain | Avalanche Fuji | Richiesto per hackathon |
| Contracts | Solidity + Foundry | Standard, ottimi test |
| Backend | Go + Fiber | Veloce, tipizzato |
| Frontend | Next.js + wagmi | Ottima DX per Web3 |
| ZK Proofs | TBD | Da decidere |

---

## 📋 Stato Implementazione

### ✅ Sprint 1: Fondamenta - COMPLETATO
- [x] Setup Go module per backend
- [x] Decidere libreria ZK (snarkjs + circom)
- [x] Setup Docker Compose (PostgreSQL + Redis)
- [ ] Setup Foundry per contracts
- [ ] Setup Next.js per frontend

### ✅ Sprint 3: Backend - COMPLETATO
- [x] Struttura progetto Go (18 file, 1491 linee)
- [x] User authentication (register/login)
- [x] OAuth 2.0 flow
- [x] JWT middleware
- [x] Database schema (PostgreSQL)
- [x] Redis caching
- [x] ZK proof verification endpoint
- [x] API REST endpoints (7 endpoints)
- [x] Docker Compose setup
- [x] Documentazione completa

**Backend pronto per l'integrazione con Avalanche!**

### ⬜ Sprint 2: Smart Contracts - TODO
- [ ] IssuerRegistry.sol
- [ ] CredentialRegistry.sol
- [ ] ProofVerifier.sol
- [ ] Test unitari
- [ ] Deploy su Fuji testnet

### ⬜ Sprint 4: Frontend - TODO
- [ ] Setup Next.js + TypeScript
- [ ] Connessione wallet (wagmi + RainbowKit)
- [ ] Generazione ZK proof in browser (snarkjs)
- [ ] Pagina wallet con credentials
- [ ] Pagina login "Continue with OwnID"
- [ ] Pagina verifica

### ⬜ Sprint 5: ZK Integration - TODO
- [ ] Implementare circuito ageCheck.circom
- [ ] Compilare con circom + setup
- [ ] Generare Groth16Verifier.sol
- [ ] Integrare nel backend (Go bindings)
- [ ] Test end-to-end

---

## ❓ Decisioni da Prendere

1. **Dove generare le ZK proof?**
   - Browser: più privacy, ma più lento
   - Backend: più veloce, ma devi fidarti del server

2. **Quale libreria ZK?**
   - snarkjs (JS): facile, funziona nel browser
   - gnark (Go): veloce, ma solo backend
   - Opzione ibrida?

3. **Verifica on-chain vs off-chain?**
   - On-chain: più trustless, ma costa gas
   - Off-chain: gratis, ma devi fidarti del verifier

4. **Come gestire la scadenza?**
   - Nella credential stessa
   - On-chain con timestamp

---

## 🚀 Quick Start

### Backend (Già Funzionante!)

```bash
# 1. Vai nella directory backend
cd backend

# 2. Copia .env
cp .env.example .env

# 3. Avvia database (Docker)
docker-compose up -d

# 4. Avvia server
go run cmd/server/main.go

# Server running su http://localhost:8080
```

**Testa le API:**
```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

📖 **Documentazione completa:** [backend/README.md](backend/README.md)

### Prossimi Step

```bash
# 1. Setup contracts (TODO)
cd contracts
forge init

# 2. Setup frontend (TODO)
cd frontend
npx create-next-app@latest .
```

---

## 📊 Progress

- ✅ **Backend**: 100% completo (API + DB + OAuth + ZK endpoint)
- 🟡 **Avalanche Integration**: 20% (struttura pronta, serve deploy contratti)
- ⬜ **Smart Contracts**: 0%
- ⬜ **ZK Circuits**: 0%
- ⬜ **Frontend**: 0%

**Totale: 45% completato**

📄 Report completo: [PROGRESS.md](PROGRESS.md)

---

## 📚 Risorse Utili

- [PolygonID Docs](https://devs.polygonid.com/) - Riferimento architetturale
- [Avalanche Docs](https://docs.avax.network/)
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi Docs](https://wagmi.sh/)
- [snarkjs](https://github.com/iden3/snarkjs)

---