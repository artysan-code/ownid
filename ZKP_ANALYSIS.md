# Analisi Fattibilità: OwnID come SPID Decentralizzato ZKP

## 🎯 Obiettivo Finale
Sistema di Identity Provider decentralizzato che fornisce **prove verificabili** senza rivelare dati reali, usando blockchain Avalanche per garantire privacy assoluta.

---

## ✅ FATTIBILITÀ: **SÌ, CON ARCHITETTURA IBRIDA**

### Approccio Consigliato: **Verifiable Credentials + Hash-based ZKP**

**Perché NON zk-SNARKs puro?**
- Complessità implementativa elevata (circom, snarkjs, trusted setup)
- Performance: generazione proof richiede secondi/minuti
- Size: circuit complexity per query selettive esplode
- Tempo sviluppo: ~3-6 mesi per sistema production-ready
- **Non necessario per l'use case**: hash-based verification raggiunge gli stessi obiettivi di privacy

**Perché SÌ Hash-based Verifiable Credentials?**
- ✅ Privacy garantita: solo hash inviati, mai dati reali
- ✅ Performance: verifica istantanea on-chain
- ✅ Complessità gestibile: implementabile in 2-4 settimane
- ✅ Standard esistenti: W3C Verifiable Credentials (adattato)
- ✅ Query selettive: verificabili tramite Merkle trees
- ✅ Firma digitale: ECDSA nativa Ethereum/Avalanche

---

## 📊 STATO ATTUALE vs STATO FINALE

### STATO ATTUALE (Prototipo Badge NFT)

**✅ Già Implementato:**
```
- Smart contract ERC721 soulbound
- Registro enti emittenti on-chain (walletToEntityId)
- Verifica hash dati privati (verifyPrivateData)
- Backend Deno con API REST
- Frontend Next.js con autenticazione JWT
- Database PostgreSQL per utenti
```

**⚠️ Limitazioni:**
```
- Badge sono NFT (troppo visibili)
- Nessun sistema di claim
- Verifica è diretta (user → contract), non mediata
- Nessun SDK per terze parti
- Nessuna integrazione OAuth-like
- Query sono binarie (sì/no su singolo campo)
```

### STATO FINALE (Identity Provider ZKP)

**🎯 Architettura Target:**

```
┌─────────────┐
│   ISSUER    │ (Università, Enti hardcoded)
│ (Hardcoded) │
└──────┬──────┘
       │ 1. Emette credenziale firmata
       ↓
┌─────────────────────────────────────────┐
│   SMART CONTRACT: CredentialRegistry    │
│   - mapping issuerAddress → issuerId    │
│   - mapping claimHash → CredentialInfo  │
│   - issuerSignature verification        │
└──────────────┬──────────────────────────┘
               │ 2. Registra claim disponibile
               ↓
┌──────────────────────────┐
│    OWNID BACKEND API     │
│ - Endpoint /claim/:id    │
│ - Verifica eligibility   │
│ - Genera credenziale     │
└──────┬───────────────────┘
       │ 3. User esegue claim
       ↓
┌────────────────────────────────┐
│   USER BROWSER (localStorage)  │
│   credentials: [                │
│     {                           │
│       type: "signedUniversity", │
│       data: {...},              │
│       issuerSignature: "0x...", │
│       merkleProof: [...]        │
│     }                           │
│   ]                             │
└──────┬─────────────────────────┘
       │ 4. Terza parte richiede verifica
       ↓
┌──────────────────────────┐
│   SITO TERZO (Spotify)   │
│ - Integra OwnID SDK      │
│ - Request: "isStudent?"  │
└──────┬───────────────────┘
       │ 5. Popup OwnID Widget
       ↓
┌─────────────────────────────────┐
│   OWNID WIDGET (iframe popup)   │
│ - Trova credenziale giusta      │
│ - Genera proof (hash + Merkle)  │
│ - User autorizza condivisione   │
└──────┬──────────────────────────┘
       │ 6. Invia proof
       ↓
┌────────────────────────────────────┐
│   SMART CONTRACT: VerificationHub │
│   - Verifica firma issuer          │
│   - Verifica Merkle proof          │
│   - Query selettive multi-issuer   │
│   - Log verification on-chain      │
└──────┬─────────────────────────────┘
       │ 7. Risultato
       ↓
┌──────────────────────────┐
│   SPOTIFY                │
│ Result: {                │
│   verified: true,        │
│   claim: "isStudent",    │
│   issuer: "TorVergata"   │ ← SOLO nome, mai dati personali
│ }                        │
└──────────────────────────┘
```

**🔑 Componenti Nuovi Necessari:**

1. **Smart Contract: CredentialRegistry**
   - Registro claim disponibili per user
   - Mapping `keccak256(userAddress, credentialType) → ClaimInfo`
   - Firma digitale issuer embedded

2. **Smart Contract: VerificationHub**
   - Verifica query da terze parti
   - Query selettive: `isStudentOf(address user, string[] universities) → bool`
   - Merkle tree verification per privacy
   - Event log per audit trail

3. **Backend: Claim API**
   - `POST /api/claim/available` - Lista claim disponibili per user
   - `POST /api/claim/execute/:id` - Esegue claim e genera credenziale
   - `GET /api/claim/:id/verify` - Verifica stato claim on-chain

4. **Frontend: OwnID Widget**
   - Iframe embeddabile in siti terzi
   - OAuth-like flow (popup → autorizzazione → callback)
   - Gestione localStorage credenziali
   - Generazione Merkle proof lato client

5. **SDK JavaScript per Terze Parti**
   ```javascript
   import { OwnIDVerifier } from '@ownid/sdk';

   const verifier = new OwnIDVerifier({ apiKey: 'xxx' });
   const result = await verifier.verify({
     claim: 'isStudent',
     issuers: ['TorVergata', 'Sapienza'], // opzionale
     callback: (proof) => console.log(proof)
   });
   ```

6. **Credenziali W3C-like**
   ```json
   {
     "@context": ["https://www.w3.org/2018/credentials/v1"],
     "id": "uuid-v4",
     "type": ["VerifiableCredential", "UniversityCredential"],
     "issuer": {
       "id": "0xIssuerAddress",
       "name": "Università Tor Vergata"
     },
     "issuanceDate": "2025-01-15T00:00:00Z",
     "expirationDate": "2029-12-31T23:59:59Z",
     "credentialSubject": {
       "id": "0xUserAddress",
       "claims": {
         "isStudent": true,
         "university": "Tor Vergata",
         "faculty": "Ingegneria",
         "enrollmentYear": 2023
       }
     },
     "proof": {
       "type": "EcdsaSecp256k1Signature2019",
       "created": "2025-01-15T10:00:00Z",
       "proofPurpose": "assertionMethod",
       "verificationMethod": "0xIssuerAddress#keys-1",
       "jws": "eyJhbGc...signature..."
     },
     "merkleTree": {
       "root": "0xMerkleRoot...",
       "leaves": ["hash(isStudent)", "hash(university)", ...]
     }
   }
   ```

---

## 🔐 FLUSSO COMPLETO: Caso d'Uso Spotify

### Fase 1: Emissione Credenziale (One-Time Setup)

```
[Università Tor Vergata]
    ↓ chiama smart contract
[CredentialRegistry.makeClaimAvailable(
    userAddress: 0xABC...,
    credentialType: "signedUniversity",
    merkleRoot: 0xROOT...,
    signature: 0xSIG...
)]
    ↓ evento emesso
[OwnID Backend] monitora eventi
    ↓ notifica user
[User Dashboard] vede "Nuova credenziale disponibile"
```

### Fase 2: Claim Credenziale

```
[User] click "Claim" su dashboard
    ↓
[POST /api/claim/execute/123]
    ↓ backend verifica on-chain
[Backend] genera credenziale firmata
    ↓ ritorna JSON
[Frontend] salva localStorage
    ↓
localStorage.setItem('ownid_credentials', JSON.stringify([credential]))
```

### Fase 3: Verifica su Spotify

```
[User] naviga spotify.com/student-discount
    ↓
[Spotify] integra OwnID SDK
<script>
  const result = await ownid.verify({ claim: 'isStudent' });
</script>
    ↓ apre popup
[OwnID Widget] iframe su ownid.com/verify
    ↓ legge localStorage
[Widget] trova credenziale "signedUniversity"
    ↓ mostra a user
[User] approva: "Condividi che sei studente (senza dati personali)"
    ↓
[Widget] genera Merkle proof per claim "isStudent"
    proof = {
      leaf: keccak256("isStudent=true"),
      siblings: [hash1, hash2, ...],
      root: 0xROOT
    }
    ↓
[Widget] chiama smart contract
[VerificationHub.verifyStudentClaim(
    userAddress: 0xABC,
    merkleProof: proof,
    allowedIssuers: [issuerIdTorVergata, issuerIdSapienza]
)]
    ↓ contract verifica
1. Merkle.verify(proof) ✓
2. CredentialRegistry.getIssuer(root) ✓
3. issuer in allowedIssuers[] ✓
4. credential non scaduta ✓
5. credential non revocata ✓
    ↓ ritorna
{ verified: true, issuerName: "Tor Vergata" }
    ↓
[Widget] invia a Spotify via postMessage
    ↓
[Spotify] riceve conferma → applica sconto studenti
```

**🔒 Privacy Garantita:**
- Spotify sa solo: "è studente" + "università Tor Vergata"
- Spotify NON sa: nome, cognome, matricola, anno, facoltà, voti
- Blockchain vede solo: hash Merkle root, firma issuer
- Nessun dato personale mai rivelato

---

## 🎨 QUERY SELETTIVE: Implementazione

### Esempio: "È iscritto a una di queste università?"

**Smart Contract:**
```solidity
function verifyUniversityClaim(
    address user,
    bytes32[] calldata merkleProof,
    uint256[] calldata allowedIssuerIds
) public view returns (bool verified, uint256 matchedIssuerId) {
    bytes32 merkleRoot = MerkleProof.extractRoot(merkleProof);

    ClaimInfo memory claim = userClaims[user][merkleRoot];
    require(claim.isValid, "Claim not found");

    // Verifica issuer in whitelist
    for (uint i = 0; i < allowedIssuerIds.length; i++) {
        if (claim.issuerId == allowedIssuerIds[i]) {
            return (true, claim.issuerId);
        }
    }

    return (false, 0);
}
```

**Frontend SDK:**
```javascript
const result = await ownid.verify({
    claim: 'isStudent',
    issuers: ['Tor Vergata', 'Sapienza', 'Roma Tre'],
    scope: ['university'] // rivela solo nome università
});

// Result:
{
    verified: true,
    claim: 'isStudent',
    issuer: 'Tor Vergata',
    // NO altri dati
}
```

---

## 🛡️ SICUREZZA E TRUST MODEL

### Issuer Hardcoded (Whitelist)

**Smart Contract:**
```solidity
contract CredentialRegistry {
    mapping(uint256 => Issuer) public approvedIssuers;
    uint256 public issuerCount;
    address public admin; // OwnID team

    struct Issuer {
        string name;
        address wallet;
        bool active;
        uint256 addedAt;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function addIssuer(string memory _name, address _wallet)
        public onlyAdmin {
        issuerCount++;
        approvedIssuers[issuerCount] = Issuer({
            name: _name,
            wallet: _wallet,
            active: true,
            addedAt: block.timestamp
        });
    }

    function revokeIssuer(uint256 issuerId) public onlyAdmin {
        approvedIssuers[issuerId].active = false;
    }
}
```

**Lista Iniziale Issuer:**
- Università Tor Vergata
- Sapienza Università di Roma
- Università Roma Tre
- Politecnico di Milano
- ...

### Firma Digitale Issuer

**Processo:**
1. Issuer genera credenziale off-chain
2. Firma con ECDSA private key: `signature = sign(keccak256(credentialData), issuerPrivateKey)`
3. Registra su chain: `merkleRoot + signature`
4. Contract verifica: `ecrecover(merkleRoot, signature) == issuerWallet`

### Revoca Credenziali

**Meccanismo:**
```solidity
mapping(bytes32 => bool) public revokedClaims;

function revokeCredential(bytes32 merkleRoot, bytes memory issuerSignature)
    public {
    address issuer = ecrecover(merkleRoot, issuerSignature);
    require(walletToIssuerId[issuer] != 0, "Not an issuer");
    revokedClaims[merkleRoot] = true;
    emit CredentialRevoked(merkleRoot, issuer);
}
```

---

## 🚀 VANTAGGI COMPETITIVI vs SPID

| Feature | SPID | OwnID ZKP |
|---------|------|-----------|
| **Privacy** | ❌ Invia dati completi | ✅ Solo hash/proof |
| **Decentralizzazione** | ❌ Provider centralizzati | ✅ Blockchain-based |
| **Selective Disclosure** | ❌ All-or-nothing | ✅ Query granulari |
| **User Control** | ❌ Provider controlla | ✅ User localStorage |
| **Interoperabilità** | ⚠️ Solo Italia | ✅ Globale |
| **Costi** | 💰 Fee per transazione | ✅ Solo gas Avalanche |
| **Vendor Lock-in** | ❌ Dipendenza provider | ✅ Open standard |
| **Audit Trail** | ⚠️ Opaco | ✅ On-chain trasparente |

---

## 📈 METRICHE DI SUCCESSO

**Performance Target:**
- Verifica claim: < 500ms (including blockchain query)
- Claim generation: < 2s
- Widget load time: < 1s
- Gas cost per verification: < $0.01 (Avalanche)

**User Experience:**
- 1-click claim da dashboard
- 2-click verification su siti terzi (popup + approve)
- Zero configurazione per end-user

**Security:**
- Zero data leaks (provabile matematicamente via Merkle proofs)
- Issuer signature verification rate: 100%
- Revocation propagation: < 5 minuti

---

## ⚠️ RISCHI E MITIGAZIONI

### Rischio 1: localStorage Vulnerabilità
**Problema**: XSS può rubare credenziali
**Mitigazione**:
- Content Security Policy (CSP) strict
- Credenziali criptate con user password-derived key
- Opzionale: Hardware wallet integration

### Rischio 2: Replay Attack
**Problema**: Riutilizzo proof su siti diversi
**Mitigazione**:
- Nonce nel Merkle proof
- Timestamp + expiration window
- Domain-binding nel proof

### Rischio 3: Issuer Compromise
**Problema**: Wallet issuer rubato
**Mitigazione**:
- Multi-sig wallet per issuer
- Revoca immediata issuer compromesso
- Time-delay per operazioni critiche

### Rischio 4: User Confusion
**Problema**: Non capiscono cosa condividono
**Mitigazione**:
- UI chiarissima: "Condividi SOLO che sei studente"
- Preview claims prima di approve
- Educational tooltips

---

## 🎯 CONCLUSIONE

**✅ FATTIBILITÀ: ALTA**

Il sistema proposto è:
- ✅ **Tecnicamente fattibile** con architettura hash-based
- ✅ **Implementabile in 3-4 settimane** (vedi roadmap)
- ✅ **Scalabile** (Avalanche C-Chain performance)
- ✅ **Privacy-preserving** (matematicamente provabile)
- ✅ **User-friendly** (OAuth-like UX familiare)

**Differenza chiave con prototipo attuale:**
- Da "Badge NFT visibili" → "Credenziali private verificabili"
- Da "Verifica diretta" → "Verifica mediata con query selettive"
- Da "On-chain storage" → "Off-chain storage + on-chain verification"

**Next Step**: Vedi `ROADMAP.md` per piano implementazione dettagliato.
