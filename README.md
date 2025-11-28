# OwnID

Identity Provider decentralizzato basato su Avalanche blockchain.

## Panoramica

OwnID è un sistema di gestione dell'identità digitale che utilizza la blockchain Avalanche per garantire sicurezza, trasparenza e controllo dell'utente sui propri dati. Il progetto è stato sviluppato per un hackathon e include un backend API costruito con Deno e un frontend moderno con Next.js.

## Caratteristiche

- Autenticazione JWT sicura
- Registrazione e login utenti
- Gestione profilo utente
- Persistenza dati con PostgreSQL
- Interfaccia utente moderna e responsive
- Architettura modulare e scalabile

## Stack Tecnologico

### Backend
- **Runtime**: Deno 2.x
- **Framework**: Oak 17.x
- **Database**: PostgreSQL 16
- **Autenticazione**: JWT (djwt)
- **Password Hashing**: SHA-256 (temporaneo, da migrare a bcrypt/argon2)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode
- **Package Manager**: pnpm

## Prerequisiti

- [Deno](https://deno.land/) v2.x o superiore
- [Node.js](https://nodejs.org/) v18+ e pnpm
- [Docker](https://www.docker.com/) e Docker Compose
- PostgreSQL 16 (opzionale se si usa Docker)

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

## Struttura del Progetto

```
ownid/
├── back-end/              # Backend API (Deno + Oak)
│   ├── main.ts           # Entry point del server
│   ├── deno.json         # Configurazione Deno
│   ├── routes/           # Route handlers
│   │   ├── index.ts      # Router principale
│   │   ├── auth.ts       # Autenticazione
│   │   └── user.ts       # Gestione utenti
│   └── db/               # Database
│       ├── connection.ts # Pool di connessioni PostgreSQL
│       └── schema.sql    # Schema database
│
├── front-end/            # Frontend (Next.js)
│   ├── app/             # App Router
│   │   ├── components/  # Componenti riutilizzabili
│   │   ├── context/     # React Context (AuthContext)
│   │   ├── login/       # Pagina login
│   │   ├── registrati/  # Pagina registrazione
│   │   └── dashboard/   # Dashboard utente
│   ├── package.json     # Dipendenze frontend
│   └── tsconfig.json    # Configurazione TypeScript
│
├── docker-compose.yaml   # Configurazione Docker per PostgreSQL
└── README.md            # Questo file
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

## Variabili d'Ambiente

### Backend (`back-end/.env`)

```env
PORT=8000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://ownid_user:ownid_password_dev@localhost:5432/ownid
JWT_SECRET=<your-secret-key>
```

## Roadmap

- [ ] Implementare bcrypt/argon2 per password hashing
- [ ] Aggiungere rate limiting
- [ ] Integrare Avalanche blockchain
- [ ] Implementare smart contracts per identità decentralizzata
- [ ] Email verification
- [ ] Password reset
- [ ] Autenticazione a due fattori (2FA)
- [ ] Gestione permessi e ruoli
- [ ] Dashboard amministratore

## Sicurezza

⚠️ **Nota Importante**: Questa è una versione sviluppata per un hackathon. Per l'uso in produzione:

- Implementare bcrypt o argon2 per l'hashing delle password (attualmente SHA-256)
- Caricare JWT_SECRET da variabili d'ambiente invece di generarlo a runtime
- Implementare rate limiting per prevenire attacchi brute force
- Abilitare HTTPS
- Validare accuratamente tutti gli input utente
- Implementare logging e monitoring adeguati
- Usare credenziali database sicure (non quelle di default)

## Contributi

Questo progetto è stato sviluppato per un hackathon. Contributi, suggerimenti e feedback sono benvenuti!

## Licenza

[Specifica la licenza del progetto]

## Contatti

[Aggiungi informazioni di contatto se necessario]
