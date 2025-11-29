#!/bin/bash

# Script per verificare lo stato della subnet Avalanche

echo "=========================================="
echo "🔍 VERIFICA STATO SUBNET"
echo "=========================================="
echo ""

# Carica le variabili d'ambiente
if [ -f .env ]; then
  source .env
else
  echo "❌ File .env non trovato"
  exit 1
fi

if [ -z "$FUJI_RPC_URL" ]; then
  echo "❌ FUJI_RPC_URL non impostato nel file .env"
  exit 1
fi

echo "🌐 RPC URL: $FUJI_RPC_URL"
echo ""

# Test connessione
echo "1️⃣  Test connessione..."
if timeout 5 curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $FUJI_RPC_URL > /dev/null 2>&1; then
  echo "   ✅ RPC endpoint raggiungibile"
else
  echo "   ❌ RPC endpoint non raggiungibile"
  echo "   Verifica che l'URL sia corretto e che la rete sia online."
  exit 1
fi

echo ""

# Block number
echo "2️⃣  Block number..."
BLOCK_NUMBER=$(cast block-number --rpc-url $FUJI_RPC_URL 2>/dev/null || echo "ERRORE")

if [ "$BLOCK_NUMBER" = "ERRORE" ]; then
  echo "   ❌ Impossibile ottenere il block number"
  exit 1
fi

echo "   Block number: $BLOCK_NUMBER"

if [ "$BLOCK_NUMBER" = "0" ]; then
  echo "   ⚠️  LA SUBNET NON STA PRODUCENDO BLOCCHI"
  echo "   La rete non è ancora operativa o ha problemi."
  echo ""
  echo "   Azioni suggerite:"
  echo "   - Contatta gli organizzatori dell'hackathon"
  echo "   - Verifica che ci siano validatori attivi"
  echo "   - Controlla la documentazione della subnet"
else
  echo "   ✅ La subnet sta producendo blocchi"
fi

echo ""

# Chain ID
echo "3️⃣  Chain ID..."
CHAIN_ID=$(cast chain-id --rpc-url $FUJI_RPC_URL 2>/dev/null || echo "ERRORE")

if [ "$CHAIN_ID" = "ERRORE" ]; then
  echo "   ❌ Impossibile ottenere il chain ID"
else
  echo "   Chain ID: $CHAIN_ID"
fi

echo ""

# Gas price
echo "4️⃣  Gas price..."
GAS_PRICE=$(cast gas-price --rpc-url $FUJI_RPC_URL 2>/dev/null || echo "ERRORE")

if [ "$GAS_PRICE" = "ERRORE" ]; then
  echo "   ⚠️  Impossibile ottenere il gas price"
else
  echo "   Gas price: $GAS_PRICE wei"
  GAS_GWEI=$(echo "scale=2; $GAS_PRICE / 1000000000" | bc 2>/dev/null || echo "N/A")
  echo "              $GAS_GWEI gwei"
fi

echo ""

# Verifica saldo wallet se PRIVATE_KEY è impostato
if [ -n "$PRIVATE_KEY" ]; then
  echo "5️⃣  Saldo wallet..."
  WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)

  if [ -n "$WALLET_ADDRESS" ]; then
    echo "   Wallet: $WALLET_ADDRESS"

    BALANCE=$(cast balance $WALLET_ADDRESS --rpc-url $FUJI_RPC_URL 2>/dev/null || echo "0")
    echo "   Saldo: $BALANCE wei"

    if [ "$BALANCE" != "0" ]; then
      BALANCE_AVAX=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc 2>/dev/null || echo "N/A")
      echo "          $BALANCE_AVAX AVAX"
    fi

    if [ "$BALANCE" = "0" ]; then
      echo "   ⚠️  Wallet senza fondi"
      echo "   Richiedi AVAX dal faucet per deployare contratti."
    else
      echo "   ✅ Wallet ha fondi sufficienti"
    fi
  fi
else
  echo "5️⃣  Saldo wallet: Skippato (PRIVATE_KEY non impostato)"
fi

echo ""
echo "=========================================="
echo "📊 RIEPILOGO"
echo "=========================================="
echo ""

if [ "$BLOCK_NUMBER" != "0" ] && [ "$BLOCK_NUMBER" != "ERRORE" ]; then
  echo "✅ LA SUBNET È OPERATIVA"
  echo ""
  echo "   Puoi procedere con il deploy del contratto:"
  echo "   ./deploy-to-subnet.sh"
else
  echo "❌ LA SUBNET NON È PRONTA"
  echo ""
  echo "   Problemi riscontrati:"
  [ "$BLOCK_NUMBER" = "0" ] && echo "   - Block number = 0 (nessun blocco prodotto)"
  [ "$BLOCK_NUMBER" = "ERRORE" ] && echo "   - Impossibile comunicare con la rete"
  echo ""
  echo "   Attendi che la subnet sia completamente operativa."
fi

echo ""
echo "=========================================="
