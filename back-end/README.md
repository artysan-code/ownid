# OwnID Backend

Backend API per OwnID - Identity Provider basato su Avalanche blockchain.

## Stack Tecnologico

- **Runtime**: Deno 2.x
- **Framework**: Oak
- **Auth**: JWT
- **Database**: In-memory (temporaneo) → PostgreSQL/Supabase (futuro)

## Setup

### Prerequisiti
- Deno installato (v2.x o superiore)

### Installazione

```bash
cd back-end
deno task dev
```

Il server sarà disponibile su `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
```

### Autenticazione

#### Registrazione
```
POST /api/auth/register
Content-Type: application/json

{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "mario@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

### Utente

#### Profilo
```
GET /api/user/profile
Authorization: Bearer <token>
```

#### Aggiorna Profilo
```
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Mario",
  "cognome": "Verdi"
}
```

## Struttura

```
back-end/
├── main.ts              # Entry point
├── deno.json            # Config Deno
├── routes/
│   ├── index.ts         # Router principale
│   ├── auth.ts          # Autenticazione
│   └── user.ts          # Gestione utenti
├── db/                  # Database logic (futuro)
├── contracts/           # Smart contract interaction (futuro)
├── utils/               # Utility functions
└── middleware/          # Custom middleware
```

## TODO

- [ ] Integrare database PostgreSQL/Supabase
- [ ] Implementare bcrypt per hashing password
- [ ] Aggiungere rate limiting
- [ ] Connessione Avalanche blockchain
- [ ] Smart contract per identità
- [ ] Email verification
- [ ] Password reset

## Sviluppo

### Watch mode
```bash
deno task dev
```

### Production
```bash
deno task start
```

## Sicurezza

⚠️ **Nota**: Questa è una versione base per l'hackathon. In produzione:
- Usa variabili d'ambiente per segreti
- Implementa bcrypt/argon2 per password
- Usa database persistente
- Aggiungi rate limiting
- Implementa HTTPS
- Valida input accuratamente
