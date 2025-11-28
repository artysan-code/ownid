# OwnID - SSO System Architecture

## 🎯 Concept

**"Continue with OwnID"** = OAuth 2.0 + Zero-Knowledge Proofs + Avalanche

Gli utenti hanno:
1. **Account OwnID** (email/password) - per identificarsi sul servizio
2. **Wallet** (MetaMask, etc.) - dove risiedono le credenziali ZK

---

## 🔄 Flusso Completo

### Scenario: User vuole accedere a "Netflix" e deve provare >18 anni

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Netflix │    │  OwnID  │    │  User   │    │ Avalanche│
└────┬────┘    └────┬────┘    └────┬────┘    └────┬─────┘
     │              │              │              │
     │ 1. "Login with OwnID"       │              │
     │─────────────>│              │              │
     │              │              │              │
     │              │ 2. Redirect to login        │
     │              │─────────────>│              │
     │              │              │              │
     │              │ 3. Email/Password           │
     │              │<─────────────│              │
     │              │              │              │
     │              │ 4. "Netflix richiede        │
     │              │     prova di età >18"       │
     │              │─────────────>│              │
     │              │              │              │
     │              │              │ 5. Connect Wallet
     │              │              │    (temporaneo)
     │              │              │              │
     │              │              │ 6. Seleziona
     │              │              │    AgeCredential
     │              │              │              │
     │              │              │ 7. Genera ZK proof
     │              │              │    (snarkjs in browser)
     │              │              │              │
     │              │ 8. Invia proof + hash       │
     │              │<─────────────│              │
     │              │              │              │
     │              │ 9. Verify on-chain          │
     │              │─────────────────────────────>│
     │              │    verifyAgeProof()         │
     │              │              │              │
     │              │<─────────────────────────────│
     │              │    ✅ Event ProofVerified   │
     │              │              │              │
     │              │ 10. Genera OAuth token      │
     │              │     scope: "age_verified"   │
     │              │              │              │
     │ 11. Redirect + token        │              │
     │<─────────────│              │              │
     │              │              │              │
     │ 12. Verifica token con OwnID│              │
     │─────────────>│              │              │
     │              │              │              │
     │<─────────────│              │              │
     │ ✅ Login OK  │              │              │
```

---

## 🗄️ Database OwnID

### Tabella: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabella: oauth_sessions
```sql
CREATE TABLE oauth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  client_app VARCHAR(255), -- "netflix.com"
  scope VARCHAR(255), -- "age_verified,residence_verified"
  credential_hash BYTEA, -- hash della credenziale usata
  tx_hash VARCHAR(66), -- hash della tx Avalanche di verifica
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### Tabella: verification_logs (Audit)
```sql
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  client_app VARCHAR(255),
  verification_type VARCHAR(50), -- "age_check", "kyc", etc.
  tx_hash VARCHAR(66), -- proof on-chain
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**NOTA**: Nessuna di queste tabelle contiene dati personali (birthDate, etc.)!

---

## 🔐 Backend API (Go)

### 1. OAuth Authorization Endpoint

```go
// POST /oauth/authorize
func HandleOAuthAuthorize(c *fiber.Ctx) error {
    req := struct {
        ClientID     string `json:"client_id"`     // "netflix.com"
        RedirectURI  string `json:"redirect_uri"`  // "https://netflix.com/callback"
        Scope        string `json:"scope"`         // "age_verified"
        State        string `json:"state"`         // CSRF token
    }{}

    if err := c.BodyParser(&req); err != nil {
        return err
    }

    // Verifica che client_id sia registrato
    client, err := db.GetOAuthClient(req.ClientID)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid client"})
    }

    // Genera authorization code
    authCode := generateAuthCode()

    // Salva in cache (Redis)
    redis.Set(authCode, fiber.Map{
        "client_id": req.ClientID,
        "scope": req.Scope,
        "redirect_uri": req.RedirectURI,
    }, 10 * time.Minute)

    // Redirect all'interfaccia di login OwnID
    return c.Redirect(fmt.Sprintf("/login?auth_code=%s", authCode))
}
```

### 2. Login + ZK Verification

```go
// POST /auth/verify-with-zk
func HandleZKVerification(c *fiber.Ctx) error {
    req := struct {
        Email          string          `json:"email"`
        Password       string          `json:"password"`
        AuthCode       string          `json:"auth_code"`
        Proof          ZKProof         `json:"proof"`
        CredentialHash string          `json:"credential_hash"`
        IssuerAddress  string          `json:"issuer_address"`
    }{}

    if err := c.BodyParser(&req); err != nil {
        return err
    }

    // 1. Verifica email/password
    user, err := db.AuthenticateUser(req.Email, req.Password)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
    }

    // 2. Recupera i dettagli OAuth dalla cache
    authData, err := redis.Get(req.AuthCode)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid auth code"})
    }

    // 3. Verifica la ZK proof ON-CHAIN
    txHash, err := avalanche.VerifyProofOnChain(
        req.Proof,
        req.CredentialHash,
        req.IssuerAddress,
    )

    if err != nil {
        // Log del tentativo fallito
        db.LogVerification(user.ID, authData.ClientID, "age_check", "", false)
        return c.Status(400).JSON(fiber.Map{"error": "Proof verification failed"})
    }

    // 4. Log del successo
    db.LogVerification(user.ID, authData.ClientID, "age_check", txHash, true)

    // 5. Genera OAuth token
    accessToken, err := jwt.GenerateToken(user.ID, authData.Scope)
    if err != nil {
        return err
    }

    // 6. Salva la sessione
    session := db.CreateOAuthSession(
        user.ID,
        authData.ClientID,
        authData.Scope,
        req.CredentialHash,
        txHash,
    )

    // 7. Redirect al client con il token
    redirectURL := fmt.Sprintf(
        "%s?code=%s&state=%s",
        authData.RedirectURI,
        accessToken,
        authData.State,
    )

    return c.JSON(fiber.Map{
        "redirect_url": redirectURL,
        "tx_hash": txHash,
    })
}
```

### 3. Avalanche Integration

```go
package avalanche

import (
    "github.com/ethereum/go-ethereum/ethclient"
    "github.com/ethereum/go-ethereum/accounts/abi/bind"
)

type ZKProof struct {
    A            [2]*big.Int       `json:"a"`
    B            [2][2]*big.Int    `json:"b"`
    C            [2]*big.Int       `json:"c"`
    PublicInputs [1]*big.Int       `json:"publicInputs"`
}

func VerifyProofOnChain(
    proof ZKProof,
    credentialHash string,
    issuerAddress string,
) (string, error) {
    // Connetti ad Avalanche Fuji
    client, err := ethclient.Dial("https://api.avax-test.network/ext/bc/C/rpc")
    if err != nil {
        return "", err
    }

    // Carica il contratto ProofVerifier
    verifierAddr := common.HexToAddress(os.Getenv("PROOF_VERIFIER_ADDRESS"))
    verifier, err := contracts.NewProofVerifier(verifierAddr, client)
    if err != nil {
        return "", err
    }

    // Crea la transazione
    auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
    if err != nil {
        return "", err
    }

    // Chiama verifyAgeProof()
    tx, err := verifier.VerifyAgeProof(
        auth,
        proof.A,
        proof.B,
        proof.C,
        proof.PublicInputs,
        common.HexToHash(credentialHash),
        common.HexToAddress(issuerAddress),
    )

    if err != nil {
        return "", err
    }

    // Aspetta la conferma
    receipt, err := bind.WaitMined(context.Background(), client, tx)
    if err != nil {
        return "", err
    }

    if receipt.Status != 1 {
        return "", fmt.Errorf("transaction failed")
    }

    return tx.Hash().Hex(), nil
}
```

---

## 🎨 Frontend (Next.js)

### Pagina: Login con ZK Verification

```typescript
// pages/login.tsx
import { useAccount, useConnect } from 'wagmi';
import { generateProof } from '@/lib/zkProofs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleLogin = async () => {
    // 1. Login con email/password
    const session = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(r => r.json());

    // 2. Ottieni i requisiti di verifica
    const requirements = session.verification_required; // es. { type: "age", minAge: 18 }

    // 3. Chiedi di connettere il wallet
    if (!isConnected) {
      await connect();
    }

    // 4. User seleziona la credenziale dal localStorage
    const credentials = JSON.parse(localStorage.getItem('ownid_credentials') || '[]');
    const selectedCredential = credentials.find(c => c.type === 'AgeCredential');

    if (!selectedCredential) {
      alert('Non hai una credenziale valida per questa verifica');
      return;
    }

    // 5. Genera la ZK proof nel browser
    const proof = await generateProof(
      selectedCredential.claims.birthDate,
      requirements.minAge
    );

    // 6. Invia tutto al backend
    const result = await fetch('/api/auth/verify-with-zk', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        auth_code: session.auth_code,
        proof: proof.proof,
        credential_hash: selectedCredential.hash,
        issuer_address: selectedCredential.issuer,
      }),
    }).then(r => r.json());

    // 7. Redirect al sito client
    window.location.href = result.redirect_url;
  };

  return (
    <div>
      <h1>Login with OwnID</h1>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Continue with OwnID</button>
    </div>
  );
}
```

### Libreria: ZK Proof Generation

```typescript
// lib/zkProofs.ts
import { groth16 } from 'snarkjs';

export async function generateProof(
  birthDate: string, // "1990-01-15"
  minAge: number
) {
  // Parse birthDate
  const [year, month, day] = birthDate.split('-').map(Number);

  // Input privati
  const input = {
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDay: new Date().getDate(),
    minAge: minAge,
  };

  // Genera la proof (usa i file compilati da circom)
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    '/circuits/ageCheck.wasm',
    '/circuits/ageCheck_final.zkey'
  );

  return {
    proof: {
      a: proof.pi_a.slice(0, 2),
      b: proof.pi_b.slice(0, 2).map(row => row.slice(0, 2)),
      c: proof.pi_c.slice(0, 2),
      publicInputs: publicSignals,
    },
  };
}
```

---

## 🔒 Sicurezza

### ✅ Cosa OwnID Vede

| Dato | Visibile | Dettaglio |
|------|----------|-----------|
| Email | ✅ | alice@example.com |
| Sito client | ✅ | netflix.com |
| Tipo di verifica | ✅ | "age_check" |
| Tx hash | ✅ | 0xabc123... (pubblico) |
| Timestamp | ✅ | 2024-01-01 10:30 |

### ❌ Cosa OwnID NON Vede

| Dato | Nascosto | Come |
|------|----------|------|
| Data di nascita | ❌ | Zero-knowledge proof |
| Indirizzo wallet | ❌ | Opzionale (può essere anonimo) |
| Contenuto credenziale | ❌ | Solo hash on-chain |
| Altre credenziali | ❌ | Salvate solo in localStorage |

### 🛡️ Attacchi Possibili

#### 1. OwnID compromesso
**Rischio**: Attaccante può vedere chi ha verificato cosa
**Mitigazione**:
- Verifica on-chain è trustless (non possono falsificare)
- Dati sensibili mai salvati

#### 2. Replay attack
**Rischio**: Riutilizzare una proof vecchia
**Mitigazione**:
```solidity
// Aggiungi nonce al contratto
mapping(bytes32 => bool) public usedProofs;

function verifyAgeProof(..., bytes32 proofHash) public {
    require(!usedProofs[proofHash], "Proof already used");
    usedProofs[proofHash] = true;
    // ... resto della verifica
}
```

#### 3. Man-in-the-middle
**Rischio**: Intercettare la proof
**Mitigazione**:
- HTTPS ovunque
- Proof è valida solo per quella sessione (auth_code one-time)

---

## 🎯 Vantaggi del Sistema

### Per gli Utenti
✅ **Un solo account** per tutti i siti
✅ **Privacy preservata** (dati nel wallet, non nel server)
✅ **Controllo totale** (disconnetti wallet quando vuoi)

### Per i Siti (Netflix, etc.)
✅ **Integrazione facile** (OAuth standard)
✅ **Verifica trustless** (controllano la tx su Avalanche)
✅ **No gestione dati sensibili** (compliance GDPR più facile)

### Per OwnID (il tuo progetto)
✅ **Business model**: Fee per verifica ($0.10 per tx)
✅ **Scalabile**: Backend stateless
✅ **Differenziatore**: ZK + blockchain

---

## 📊 Confronto con Alternative

| Sistema | Privacy | Trustless | UX | Decentralized |
|---------|---------|-----------|-----|---------------|
| **OwnID (questo)** | ✅ | ✅ | ✅ | ⚠️ (hybrid) |
| Google OAuth | ❌ | ❌ | ✅✅ | ❌ |
| PolygonID | ✅✅ | ✅ | ❌ | ✅ |
| Auth0 | ❌ | ❌ | ✅ | ❌ |

---

## 🚀 Roadmap

### MVP (Hackathon)
- [ ] Sistema OAuth base
- [ ] Verifica on-chain di AgeCredential
- [ ] Demo con sito client di esempio

### v1.0
- [ ] Multiple credential types (KYC, residence, etc.)
- [ ] Mobile app (React Native)
- [ ] Issuer portal (per governi/banche)

### v2.0
- [ ] Credential marketplace
- [ ] Reputation system
- [ ] Cross-chain (Polygon, Ethereum, etc.)

---

## 💡 Domande Aperte

1. **Wallet linking**: Come impedire a un utente di avere più account OwnID con lo stesso wallet?
   - Opzione: Permetterlo (privacy)
   - Opzione: Hash del wallet come ID unico

2. **Revoca delle sessioni**: Se una credenziale viene revocata, revocare anche tutte le sessioni OAuth attive?

3. **Pricing**: Come far pagare i siti client? Per verifica? Subscription?

---

## 🔗 Risorse

- [OAuth 2.0 Spec](https://oauth.net/2/)
- [OpenID Connect](https://openid.net/connect/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
