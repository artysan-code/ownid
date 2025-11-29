#!/bin/bash

# Script interattivo per PublicBadgeNetwork

CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
RPC_URL="http://localhost:8545"

# Account Anvil
ACCOUNT_0_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ACCOUNT_0_ADDR="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ACCOUNT_1_ADDR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

echo "=========================================="
echo "🎓 PublicBadgeNetwork - Script Interattivo"
echo "=========================================="
echo ""
echo "Contract: $CONTRACT_ADDRESS"
echo "RPC: $RPC_URL"
echo ""
echo "Scegli un'azione:"
echo "1) Registra un nuovo ente"
echo "2) Emetti un badge"
echo "3) Leggi informazioni badge"
echo "4) Verifica dati privati"
echo "5) Controlla proprietario badge"
echo "6) Test completo automatico"
echo "0) Esci"
echo ""
read -p "Scelta [0-6]: " choice

case $choice in
  1)
    echo ""
    read -p "Nome dell'ente: " entity_name
    echo "Registrando ente: $entity_name"

    cast send $CONTRACT_ADDRESS \
      "registerAsEntity(string)" \
      "$entity_name" \
      --private-key $ACCOUNT_0_PK \
      --rpc-url $RPC_URL

    echo "✅ Ente registrato!"

    ENTITY_ID=$(cast call $CONTRACT_ADDRESS \
      "walletToEntityId(address)(uint256)" \
      $ACCOUNT_0_ADDR \
      --rpc-url $RPC_URL)

    echo "Entity ID: $ENTITY_ID"
    ;;

  2)
    echo ""
    read -p "Indirizzo studente (default: $ACCOUNT_1_ADDR): " student_addr
    student_addr=${student_addr:-$ACCOUNT_1_ADDR}

    read -p "Titolo del badge: " title
    read -p "Specializzazione: " spec
    read -p "Giorni di validità (0 = permanente): " days
    read -p "Dati privati (opzionali): " private_data

    echo "Emettendo badge..."

    cast send $CONTRACT_ADDRESS \
      "issueBadge(address,string,string,uint256,string)" \
      "$student_addr" \
      "$title" \
      "$spec" \
      "$days" \
      "$private_data" \
      --private-key $ACCOUNT_0_PK \
      --rpc-url $RPC_URL

    echo "✅ Badge emesso!"
    ;;

  3)
    echo ""
    read -p "ID del badge: " badge_id

    echo "Leggendo badge #$badge_id..."

    cast call $CONTRACT_ADDRESS \
      "getBadgeInfo(uint256)(string,string,string,string,uint256)" \
      "$badge_id" \
      --rpc-url $RPC_URL
    ;;

  4)
    echo ""
    read -p "ID del badge: " badge_id
    read -p "Dati da verificare: " data_to_verify

    RESULT=$(cast call $CONTRACT_ADDRESS \
      "verifyPrivateData(uint256,string)(bool)" \
      "$badge_id" \
      "$data_to_verify" \
      --rpc-url $RPC_URL)

    if [ "$RESULT" == "true" ]; then
      echo "✅ Dati corretti!"
    else
      echo "❌ Dati NON corrispondono!"
    fi
    ;;

  5)
    echo ""
    read -p "ID del badge: " badge_id

    OWNER=$(cast call $CONTRACT_ADDRESS \
      "ownerOf(uint256)(address)" \
      "$badge_id" \
      --rpc-url $RPC_URL)

    echo "Proprietario del badge #$badge_id: $OWNER"
    ;;

  6)
    echo ""
    echo "Eseguendo test automatico completo..."
    bash test-contract.sh
    ;;

  0)
    echo "Uscita."
    exit 0
    ;;

  *)
    echo "Scelta non valida!"
    exit 1
    ;;
esac
