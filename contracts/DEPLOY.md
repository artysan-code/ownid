# Deploy Guide - PublicBadgeNetwork

Questa guida spiega come fare il deploy del contratto PublicBadgeNetwork sulla blockchain Avalanche.

## Prerequisiti

1. **Installare Foundry**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Installare le dipendenze**:
   ```bash
   cd contracts
   forge install OpenZeppelin/openzeppelin-contracts --no-commit
   ```

3. **Compilare i contratti**:
   ```bash
   forge build
   ```

## Configurazione

1. **Crea il file `.env`** copiando `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Modifica `.env`** con i tuoi dati:
   - `PRIVATE_KEY`: La chiave privata del tuo wallet (SENZA 0x all'inizio)
   - Usa `FUJI_RPC_URL` per testnet o `AVALANCHE_RPC_URL` per mainnet

⚠️ **ATTENZIONE**: Non condividere mai la tua chiave privata! Aggiungi `.env` al `.gitignore`

## Deploy su Avalanche Fuji Testnet (Consigliato per testing)

1. **Ottieni AVAX Testnet** dal faucet:
   - Vai su https://faucet.avax.network
   - Inserisci il tuo indirizzo wallet
   - Seleziona "Fuji (C-Chain)"

2. **Esegui il deploy**:
   ```bash
   forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
     --rpc-url $FUJI_RPC_URL \
     --private-key $PRIVATE_KEY \
     --broadcast \
     --verify \
     -vvvv
   ```

3. **Verifica il contratto** su Snowtrace Testnet:
   - Vai su https://testnet.snowtrace.io
   - Cerca l'indirizzo del contratto deployato

## Deploy su Avalanche C-Chain Mainnet

⚠️ **ATTENZIONE**: Questo costerà AVAX reali!

```bash
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url $AVALANCHE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

## Deploy senza verifica automatica

Se non hai l'API key di Snowtrace, ometti `--verify`:

```bash
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

Puoi verificare manualmente dopo su https://testnet.snowtrace.io o https://snowtrace.io

## Verifica manuale del contratto

Se il deploy è avvenuto ma la verifica automatica è fallita:

```bash
forge verify-contract \
  --chain-id 43113 \
  --compiler-version v0.8.20 \
  <CONTRACT_ADDRESS> \
  src/PublicBadgeNetwork.sol:PublicBadgeNetwork \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

Sostituisci `43113` con `43114` per mainnet.

## Informazioni utili

### Chain IDs
- **Avalanche Fuji Testnet**: 43113
- **Avalanche C-Chain Mainnet**: 43114

### RPC URLs
- **Fuji Testnet**: https://api.avax-test.network/ext/bc/C/rpc
- **Mainnet**: https://api.avax.network/ext/bc/C/rpc

### Block Explorers
- **Fuji Testnet**: https://testnet.snowtrace.io
- **Mainnet**: https://snowtrace.io

### Faucet (Testnet)
- https://faucet.avax.network

## Test locali

Prima del deploy, testa il contratto localmente:

```bash
# Avvia una blockchain locale
anvil

# In un altro terminale, esegui il deploy su localhost
forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## Troubleshooting

### Errore "Insufficient funds"
Assicurati di avere abbastanza AVAX nel wallet per il gas. Su testnet, usa il faucet.

### Errore "nonce too low"
Il wallet ha già fatto transazioni. Foundry gestisce automaticamente il nonce.

### Errore di compilazione OpenZeppelin
Controlla che il file `remappings.txt` esista e contenga:
```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

## Dopo il deploy

1. Salva l'indirizzo del contratto deployato
2. Aggiorna il backend per interagire con il contratto
3. Testa le funzioni:
   - `registerAsEntity()` per registrare un ente
   - `issueBadge()` per emettere badge
   - `getBadgeInfo()` per leggere i dati dei badge
