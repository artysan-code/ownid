package avalanche

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Client struct {
	ethClient  *ethclient.Client
	privateKey *ecdsa.PrivateKey
	chainID    *big.Int

	// Contract addresses
	proofVerifierAddr string
}

func NewClient(rpcURL string, privateKeyHex string, chainID int64, proofVerifierAddr string) (*Client, error) {
	// Connect to Avalanche
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Avalanche: %w", err)
	}

	// Parse private key
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	return &Client{
		ethClient:         client,
		privateKey:        privateKey,
		chainID:           big.NewInt(chainID),
		proofVerifierAddr: proofVerifierAddr,
	}, nil
}

type ZKProofData struct {
	A            [2]*big.Int
	B            [2][2]*big.Int
	C            [2]*big.Int
	PublicInputs [1]*big.Int
}

func (c *Client) VerifyAgeProof(
	ctx context.Context,
	proof ZKProofData,
	credentialHash common.Hash,
	issuerAddress common.Address,
) (string, error) {
	// Get auth (transactor)
	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, c.chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	// Set gas limit (you may need to adjust this)
	auth.GasLimit = uint64(300000)

	// Get the contract address
	contractAddr := common.HexToAddress(c.proofVerifierAddr)

	// Create the contract instance
	// NOTE: You'll need to generate the Go bindings from the Solidity contract
	// For now, we'll use raw transaction calls
	// verifier, err := contracts.NewProofVerifier(contractAddr, c.ethClient)

	// For demonstration, we'll show how to call the contract method
	// You need to replace this with the actual generated bindings

	// Prepare the call data
	// This is a simplified version - you'll need the actual ABI
	fmt.Printf("Calling ProofVerifier at %s\n", contractAddr.Hex())
	fmt.Printf("Credential Hash: %s\n", credentialHash.Hex())
	fmt.Printf("Issuer: %s\n", issuerAddress.Hex())

	// TODO: Replace with actual contract call
	// tx, err := verifier.VerifyAgeProof(auth, proof.A, proof.B, proof.C, proof.PublicInputs, credentialHash, issuerAddress)
	// if err != nil {
	//     return "", fmt.Errorf("failed to call verifyAgeProof: %w", err)
	// }

	// For now, return a mock transaction hash
	// In production, you would:
	// 1. Generate Go bindings: abigen --abi=ProofVerifier.abi --pkg=contracts --out=contracts/proof_verifier.go
	// 2. Call the contract method
	// 3. Wait for receipt
	// 4. Return tx.Hash().Hex()

	txHash := "0x" + credentialHash.Hex()[2:10] + "...mock"

	return txHash, nil
}

func (c *Client) Close() {
	c.ethClient.Close()
}

// Helper function to convert string proof to big.Int format
func ParseProof(proofData map[string]interface{}) (ZKProofData, error) {
	var proof ZKProofData

	// Parse A
	aSlice := proofData["a"].([]interface{})
	proof.A[0] = new(big.Int)
	proof.A[0].SetString(aSlice[0].(string), 10)
	proof.A[1] = new(big.Int)
	proof.A[1].SetString(aSlice[1].(string), 10)

	// Parse B
	bSlice := proofData["b"].([]interface{})
	for i := 0; i < 2; i++ {
		bInner := bSlice[i].([]interface{})
		for j := 0; j < 2; j++ {
			proof.B[i][j] = new(big.Int)
			proof.B[i][j].SetString(bInner[j].(string), 10)
		}
	}

	// Parse C
	cSlice := proofData["c"].([]interface{})
	proof.C[0] = new(big.Int)
	proof.C[0].SetString(cSlice[0].(string), 10)
	proof.C[1] = new(big.Int)
	proof.C[1].SetString(cSlice[1].(string), 10)

	// Parse public inputs
	publicInputs := proofData["publicInputs"].([]interface{})
	proof.PublicInputs[0] = new(big.Int)
	proof.PublicInputs[0].SetString(publicInputs[0].(string), 10)

	return proof, nil
}
