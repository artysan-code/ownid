#!/bin/bash

# Script per deployare PublicBadgeNetwork sulla subnet Avalanche
# Usa questo script quando la subnet è operativa (block number > 0)

set -e  # Exit on error

echo "=========================================="
echo "🚀 DEPLOY PUBLICBADGENETWORK - SUBNET"
echo "=========================================="
echo ""

# Carica le variabili d'ambiente
source .env

# Verifica che le variabili siano impostate
if [ -z "$FUJI_RPC_URL" ]; then
  echo "❌ ERRORE: FUJI_RPC_URL non impostato nel file .env"
  exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
  echo "❌ ERRORE: PRIVATE_KEY non impostato nel file .env"
  exit 1
fi

echo "📋 Configurazione:"
echo "   RPC URL: $FUJI_RPC_URL"
echo "   Wallet: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo ""

# Step 1: Verifica stato della rete
echo "=========================================="
echo "1️⃣  Verifica stato della rete"
echo "=========================================="
echo ""

BLOCK_NUMBER=$(cast block-number --rpc-url $FUJI_RPC_URL 2>/dev/null || echo "0")

echo "Block number corrente: $BLOCK_NUMBER"
echo ""

if [ "$BLOCK_NUMBER" = "0" ]; then
  echo "⚠️  ATTENZIONE: La rete ha block number 0"
  echo "   Questo significa che la subnet non sta producendo blocchi."
  echo ""
  read -p "Vuoi continuare comunque? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy annullato."
    exit 1
  fi
fi

# Step 2: Verifica saldo
echo "=========================================="
echo "2️⃣  Verifica saldo wallet"
echo "=========================================="
echo ""

WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Indirizzo wallet: $WALLET_ADDRESS"

BALANCE=$(cast balance $WALLET_ADDRESS --rpc-url $FUJI_RPC_URL)
echo "Saldo: $BALANCE wei"

# Converti in AVAX (dividi per 10^18)
BALANCE_AVAX=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc)
echo "       $BALANCE_AVAX AVAX"
echo ""

if [ "$BALANCE" = "0" ]; then
  echo "⚠️  ATTENZIONE: Il wallet ha saldo 0"
  echo "   Hai bisogno di AVAX per pagare il gas del deploy."
  echo ""
  echo "   Se è una subnet testnet, richiedi fondi dal faucet dell'hackathon."
  echo ""
  read -p "Vuoi continuare comunque? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy annullato."
    exit 1
  fi
fi

# Step 3: Pulisci cache e broadcast precedenti
echo "=========================================="
echo "3️⃣  Pulizia cache e broadcast"
echo "=========================================="
echo ""

echo "Rimuovendo cache e broadcast locali..."
rm -rf cache/ broadcast/
echo "✅ Cache pulita"
echo ""

# Step 4: Compila i contratti
echo "=========================================="
echo "4️⃣  Compilazione contratti"
echo "=========================================="
echo ""

forge build

if [ $? -ne 0 ]; then
  echo "❌ Errore durante la compilazione"
  exit 1
fi

echo "✅ Compilazione completata"
echo ""

# Step 5: Deploy del contratto
echo "=========================================="
echo "5️⃣  Deploy del contratto"
echo "=========================================="
echo ""

echo "Deploying PublicBadgeNetwork..."
echo ""

DEPLOY_OUTPUT=$(forge script script/DeployPublicBadgeNetwork.s.sol:DeployPublicBadgeNetwork \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvv 2>&1)

echo "$DEPLOY_OUTPUT"

# Estrai l'indirizzo del contratto dall'output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "PublicBadgeNetwork deployed at:" | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo ""
  echo "❌ Errore: Non riesco a trovare l'indirizzo del contratto deployato"
  echo "   Controlla l'output sopra per errori."
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ DEPLOY COMPLETATO!"
echo "=========================================="
echo ""
echo "📝 Informazioni Deploy:"
echo "   Contract Address: $CONTRACT_ADDRESS"
echo "   Network RPC: $FUJI_RPC_URL"
echo "   Block Number: $(cast block-number --rpc-url $FUJI_RPC_URL)"
echo ""

# Step 6: Aggiorna il backend
echo "=========================================="
echo "6️⃣  Aggiornamento configurazione backend"
echo "=========================================="
echo ""

BACKEND_ENV="../back-end/.env"

if [ -f "$BACKEND_ENV" ]; then
  echo "Aggiornando $BACKEND_ENV..."

  # Backup del file .env
  cp "$BACKEND_ENV" "${BACKEND_ENV}.backup"
  echo "   Backup creato: ${BACKEND_ENV}.backup"

  # Aggiorna l'indirizzo del contratto
  if grep -q "CONTRACT_ADDRESS=" "$BACKEND_ENV"; then
    sed -i "s|CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" "$BACKEND_ENV"
    echo "   ✅ CONTRACT_ADDRESS aggiornato"
  else
    echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> "$BACKEND_ENV"
    echo "   ✅ CONTRACT_ADDRESS aggiunto"
  fi

  # Aggiorna l'RPC URL se diverso
  if grep -q "BLOCKCHAIN_RPC_URL=" "$BACKEND_ENV"; then
    sed -i "s|BLOCKCHAIN_RPC_URL=.*|BLOCKCHAIN_RPC_URL=$FUJI_RPC_URL|" "$BACKEND_ENV"
    echo "   ✅ BLOCKCHAIN_RPC_URL aggiornato"
  fi

  echo ""
  echo "   Il backend si riavvierà automaticamente con la nuova configurazione."
else
  echo "⚠️  File $BACKEND_ENV non trovato"
  echo "   Dovrai aggiornare manualmente:"
  echo "   CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
  echo "   BLOCKCHAIN_RPC_URL=$FUJI_RPC_URL"
fi

echo ""

# Step 7: Riepilogo finale
echo "=========================================="
echo "📋 RIEPILOGO DEPLOY"
echo "=========================================="
echo ""
echo "✅ Contratto deployato con successo!"
echo ""
echo "🔗 Informazioni Contratto:"
echo "   Nome: PublicBadgeNetwork"
echo "   Indirizzo: $CONTRACT_ADDRESS"
echo "   Network: Subnet Avalanche"
echo "   RPC: $FUJI_RPC_URL"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Verifica il contratto su block explorer (se disponibile)"
echo "   2. Il backend è stato aggiornato automaticamente"
echo "   3. Testa le funzionalità del contratto"
echo "   4. Aggiorna il frontend se necessario"
echo ""
echo "🧪 Test rapido:"
echo "   cast call $CONTRACT_ADDRESS \"name()\" --rpc-url $FUJI_RPC_URL"
echo ""
echo "=========================================="
echo "🎉 Deploy completato!"
echo "=========================================="
