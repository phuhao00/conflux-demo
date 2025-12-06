package blockchain

import (
	"fmt"
	"log"
	"math/big"
	"time"

	"conflux-demo/backend/config"

	sdk "github.com/Conflux-Chain/go-conflux-sdk"
	"github.com/Conflux-Chain/go-conflux-sdk/types"
	"github.com/Conflux-Chain/go-conflux-sdk/types/cfxaddress"
)

type Client struct {
	SDK        *sdk.Client
	AccountMgr *sdk.AccountManager
	Config     *config.Config
}

var confluxClient *Client

// Initialize sets up the Conflux client
func Initialize(cfg *config.Config) error {
	client, err := sdk.NewClient(cfg.ConfluxRPCURL)
	if err != nil {
		return fmt.Errorf("failed to create Conflux client: %w", err)
	}

	accountMgr := sdk.NewAccountManager("./keystore", cfg.ConfluxNetworkID)

	confluxClient = &Client{
		SDK:        client,
		AccountMgr: accountMgr,
		Config:     cfg,
	}

	log.Println("Conflux client initialized successfully")
	return nil
}

// GetClient returns the Conflux client instance
func GetClient() *Client {
	return confluxClient
}

// GetBalance returns the CFX balance of an address
func (c *Client) GetBalance(address string) (*big.Int, error) {
	addr, err := cfxaddress.NewFromBase32(address)
	if err != nil {
		return nil, fmt.Errorf("invalid address: %w", err)
	}

	balance, err := c.SDK.GetBalance(addr)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance.ToInt(), nil
}

// SendTransaction sends a transaction to the Conflux network
func (c *Client) SendTransaction(to string, value *big.Int, data []byte) (string, error) {
	if c.Config.PrivateKey == "" {
		return "", fmt.Errorf("private key not configured")
	}

	// Import account from private key
	account, err := c.AccountMgr.ImportKey(c.Config.PrivateKey, "")
	if err != nil {
		return "", fmt.Errorf("failed to import account: %w", err)
	}

	toAddr, err := cfxaddress.NewFromBase32(to)
	if err != nil {
		return "", fmt.Errorf("invalid to address: %w", err)
	}

	// Create unsigned transaction
	utx := types.UnsignedTransaction{
		UnsignedTransactionBase: types.UnsignedTransactionBase{
			From:  &account,
			Value: types.NewBigIntByRaw(value),
		},
		To:   &toAddr,
		Data: data,
	}

	// Send transaction
	txHash, err := c.SDK.SendTransaction(utx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return txHash.String(), nil
}

// GetTransactionReceipt gets the receipt of a transaction
func (c *Client) GetTransactionReceipt(txHash string) (*types.TransactionReceipt, error) {
	hash := types.Hash(txHash)
	receipt, err := c.SDK.GetTransactionReceipt(hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction receipt: %w", err)
	}

	return receipt, nil
}

// WaitForReceipt waits for a transaction to be mined
func (c *Client) WaitForReceipt(txHash string) (*types.TransactionReceipt, error) {
	hash := types.Hash(txHash)
	receipt, err := c.SDK.WaitForTransationReceipt(hash, 60*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to wait for receipt: %w", err)
	}

	return receipt, nil
}
