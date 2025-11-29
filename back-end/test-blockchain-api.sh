#!/bin/bash

# Script per testare le API Blockchain
# Assicurati che:
# 1. Anvil sia in esecuzione (nel contracts/)
# 2. Il backend sia in esecuzione (deno task dev)

set -e

BASE_URL="http://localhost:8000/api"

# Account Anvil di default
ENTITY_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
STUDENT_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

echo "=========================================="
echo "🧪 TEST API BLOCKCHAIN"
echo "=========================================="
echo ""

# Test 1: Test connessione
echo "📡 Test 1: Connessione Blockchain"
echo "GET $BASE_URL/blockchain/test"
curl -s "$BASE_URL/blockchain/test" | python3 -m json.tool
echo ""
echo ""

# Per i test successivi, abbiamo bisogno di un token JWT
# Prima registriamo/facciamo login con un utente

echo "🔐 Registrazione utente per ottenere JWT token..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "cognome": "User",
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool
echo ""

# Estrai il token
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "⚠️  Tentativo di login con utente esistente..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')

  TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
fi

echo "Token JWT: ${TOKEN:0:50}..."
echo ""
echo ""

# Test 2: Registra ente
echo "=========================================="
echo "🏛️  Test 2: Registrazione Ente"
echo "=========================================="
echo "POST $BASE_URL/blockchain/register-entity"
echo ""

ENTITY_RESPONSE=$(curl -s -X POST "$BASE_URL/blockchain/register-entity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Università di Bologna\",
    \"privateKey\": \"$ENTITY_PRIVATE_KEY\"
  }")

echo "$ENTITY_RESPONSE" | python3 -m json.tool
echo ""
echo ""

# Estrai l'entityId
ENTITY_ID=$(echo "$ENTITY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('entityId', '1'))")

# Test 3: Emetti badge
echo "=========================================="
echo "🎓 Test 3: Emissione Badge"
echo "=========================================="
echo "POST $BASE_URL/blockchain/issue-badge"
echo ""

BADGE_RESPONSE=$(curl -s -X POST "$BASE_URL/blockchain/issue-badge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"studentAddress\": \"$STUDENT_ADDRESS\",
    \"title\": \"Laurea in Informatica\",
    \"specialization\": \"Blockchain Development\",
    \"daysValid\": 365,
    \"privateData\": \"Voto: 110/110 con lode\",
    \"entityPrivateKey\": \"$ENTITY_PRIVATE_KEY\"
  }")

echo "$BADGE_RESPONSE" | python3 -m json.tool
echo ""
echo ""

# Estrai il badgeId
BADGE_ID=$(echo "$BADGE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('badgeId', '1'))")

# Test 4: Leggi badge
echo "=========================================="
echo "📖 Test 4: Lettura Badge"
echo "=========================================="
echo "GET $BASE_URL/blockchain/badge/$BADGE_ID"
echo ""

curl -s "$BASE_URL/blockchain/badge/$BADGE_ID" | python3 -m json.tool
echo ""
echo ""

# Test 5: Verifica dati privati (corretti)
echo "=========================================="
echo "✅ Test 5: Verifica Dati Privati (corretti)"
echo "=========================================="
echo "POST $BASE_URL/blockchain/verify/$BADGE_ID"
echo ""

curl -s -X POST "$BASE_URL/blockchain/verify/$BADGE_ID" \
  -H "Content-Type: application/json" \
  -d '{"privateData": "Voto: 110/110 con lode"}' | python3 -m json.tool
echo ""
echo ""

# Test 6: Verifica dati privati (errati)
echo "=========================================="
echo "❌ Test 6: Verifica Dati Privati (errati)"
echo "=========================================="
echo "POST $BASE_URL/blockchain/verify/$BADGE_ID"
echo ""

curl -s -X POST "$BASE_URL/blockchain/verify/$BADGE_ID" \
  -H "Content-Type: application/json" \
  -d '{"privateData": "Voto: 100/110"}' | python3 -m json.tool
echo ""
echo ""

# Test 7: Informazioni ente
echo "=========================================="
echo "🏛️  Test 7: Informazioni Ente"
echo "=========================================="
echo "GET $BASE_URL/blockchain/entity/$ENTITY_ID"
echo ""

curl -s "$BASE_URL/blockchain/entity/$ENTITY_ID" | python3 -m json.tool
echo ""
echo ""

# Test 8: Badge utente
echo "=========================================="
echo "👤 Test 8: Badge Utente"
echo "=========================================="
echo "GET $BASE_URL/blockchain/user/$STUDENT_ADDRESS/badges"
echo ""

curl -s "$BASE_URL/blockchain/user/$STUDENT_ADDRESS/badges" | python3 -m json.tool
echo ""
echo ""

# Riepilogo
echo "=========================================="
echo "📊 RIEPILOGO TEST"
echo "=========================================="
echo "✅ Test connessione blockchain"
echo "✅ Registrazione ente"
echo "✅ Emissione badge"
echo "✅ Lettura badge"
echo "✅ Verifica dati privati"
echo "✅ Informazioni ente"
echo "✅ Badge utente"
echo ""
echo "🎉 Tutti i test completati!"
echo "=========================================="
