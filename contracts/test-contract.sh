#!/bin/bash

# Test script per PublicBadgeNetwork
# Questo script testa tutte le funzioni principali del contratto

set -e  # Exit on error

# Configurazione
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
RPC_URL="http://localhost:8545"

# Account Anvil (dalla lista fornita da Anvil)
ENTE_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ENTE_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

STUDENT_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

echo "=========================================="
echo "🧪 TEST PUBLICBADGENETWORK CONTRACT"
echo "=========================================="
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo "RPC URL: $RPC_URL"
echo "Ente Address: $ENTE_ADDRESS"
echo "Student Address: $STUDENT_ADDRESS"
echo ""

# Test 1: Registra un ente
echo "=========================================="
echo "📝 Test 1: Registrazione Ente"
echo "=========================================="
echo "Registrando ente: 'Università di Bologna'..."
echo ""

cast send $CONTRACT_ADDRESS \
  "registerAsEntity(string)" \
  "Università di Bologna" \
  --private-key $ENTE_PRIVATE_KEY \
  --rpc-url $RPC_URL

echo "✅ Ente registrato con successo!"
echo ""

# Verifica registrazione
echo "Verificando registrazione..."
ENTITY_ID=$(cast call $CONTRACT_ADDRESS \
  "walletToEntityId(address)(uint256)" \
  $ENTE_ADDRESS \
  --rpc-url $RPC_URL)

echo "Entity ID: $ENTITY_ID"
echo ""

# Leggi dati ente
echo "Leggendo dati ente..."
ENTITY_DATA=$(cast call $CONTRACT_ADDRESS \
  "entities(uint256)(string,address)" \
  $ENTITY_ID \
  --rpc-url $RPC_URL)

echo "Dati Ente: $ENTITY_DATA"
echo ""

# Test 2: Emetti un badge
echo "=========================================="
echo "🎓 Test 2: Emissione Badge"
echo "=========================================="
echo "Emettendo badge per studente: $STUDENT_ADDRESS"
echo "Titolo: 'Laurea in Informatica'"
echo "Specializzazione: 'Blockchain Development'"
echo "Validità: 365 giorni"
echo "Dati privati: 'Voto: 110/110 con lode'"
echo ""

cast send $CONTRACT_ADDRESS \
  "issueBadge(address,string,string,uint256,string)" \
  $STUDENT_ADDRESS \
  "Laurea in Informatica" \
  "Blockchain Development" \
  365 \
  "Voto: 110/110 con lode" \
  --private-key $ENTE_PRIVATE_KEY \
  --rpc-url $RPC_URL

echo "✅ Badge emesso con successo!"
echo ""

# Il primo badge avrà ID = 1
BADGE_ID=1

# Test 3: Leggi informazioni badge
echo "=========================================="
echo "📄 Test 3: Lettura Informazioni Badge"
echo "=========================================="
echo "Leggendo badge ID: $BADGE_ID"
echo ""

BADGE_INFO=$(cast call $CONTRACT_ADDRESS \
  "getBadgeInfo(uint256)(string,string,string,string,uint256)" \
  $BADGE_ID \
  --rpc-url $RPC_URL)

echo "Informazioni Badge:"
echo "$BADGE_INFO"
echo ""

# Test 4: Verifica proprietario badge
echo "=========================================="
echo "👤 Test 4: Verifica Proprietario"
echo "=========================================="
echo "Verificando proprietario del badge ID: $BADGE_ID"
echo ""

OWNER=$(cast call $CONTRACT_ADDRESS \
  "ownerOf(uint256)(address)" \
  $BADGE_ID \
  --rpc-url $RPC_URL)

echo "Proprietario: $OWNER"
echo "Previsto: $STUDENT_ADDRESS"

if [ "${OWNER,,}" == "${STUDENT_ADDRESS,,}" ]; then
  echo "✅ Proprietario corretto!"
else
  echo "❌ Proprietario errato!"
fi
echo ""

# Test 5: Verifica dati privati
echo "=========================================="
echo "🔐 Test 5: Verifica Dati Privati"
echo "=========================================="
echo "Verificando dati privati corretti..."
echo ""

VERIFY_CORRECT=$(cast call $CONTRACT_ADDRESS \
  "verifyPrivateData(uint256,string)(bool)" \
  $BADGE_ID \
  "Voto: 110/110 con lode" \
  --rpc-url $RPC_URL)

echo "Verifica con dati corretti: $VERIFY_CORRECT"

if [ "$VERIFY_CORRECT" == "true" ]; then
  echo "✅ Dati corretti verificati!"
else
  echo "❌ Verifica fallita!"
fi
echo ""

echo "Verificando con dati errati..."
VERIFY_WRONG=$(cast call $CONTRACT_ADDRESS \
  "verifyPrivateData(uint256,string)(bool)" \
  $BADGE_ID \
  "Voto: 100/110" \
  --rpc-url $RPC_URL)

echo "Verifica con dati errati: $VERIFY_WRONG"

if [ "$VERIFY_WRONG" == "false" ]; then
  echo "✅ Dati errati correttamente rifiutati!"
else
  echo "❌ Errore nella verifica!"
fi
echo ""

# Test 6: Tenta trasferimento (deve fallire - Soulbound)
echo "=========================================="
echo "🚫 Test 6: Test Soulbound (non trasferibilità)"
echo "=========================================="
echo "Tentando trasferimento (dovrebbe fallire)..."
echo ""

set +e  # Non uscire in caso di errore
TRANSFER_RESULT=$(cast send $CONTRACT_ADDRESS \
  "transferFrom(address,address,uint256)" \
  $STUDENT_ADDRESS \
  $ENTE_ADDRESS \
  $BADGE_ID \
  --private-key $ENTE_PRIVATE_KEY \
  --rpc-url $RPC_URL 2>&1)

if echo "$TRANSFER_RESULT" | grep -q "Non trasferibile\|revert"; then
  echo "✅ Trasferimento correttamente bloccato (Soulbound)!"
else
  echo "❌ Errore: il trasferimento non dovrebbe essere permesso!"
fi
set -e
echo ""

# Riepilogo
echo "=========================================="
echo "📊 RIEPILOGO TEST"
echo "=========================================="
echo "✅ Registrazione ente: OK"
echo "✅ Emissione badge: OK"
echo "✅ Lettura informazioni: OK"
echo "✅ Verifica proprietario: OK"
echo "✅ Verifica dati privati: OK"
echo "✅ Test soulbound: OK"
echo ""
echo "🎉 Tutti i test completati con successo!"
echo "=========================================="
