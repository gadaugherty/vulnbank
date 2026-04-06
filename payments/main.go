// VulnBank Payments Service — DELIBERATELY VULNERABLE for DevSecOps demonstration.
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

// VULNERABILITY: Hardcoded credentials (CWE-798)
var (
	dbHost = "postgres"
	dbName = "vulnbank"
	dbUser = "admin"
	dbPass = "admin123"
)

var db *sql.DB

type TransferRequest struct {
	FromUserID  int     `json:"from_user_id"`
	ToUserID    int     `json:"to_user_id"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type TransferResponse struct {
	Message string `json:"message"`
	TxID    int    `json:"tx_id,omitempty"`
	Error   string `json:"error,omitempty"`
}

func initDB() {
	connStr := fmt.Sprintf("host=%s dbname=%s user=%s password=%s sslmode=disable",
		dbHost, dbName, dbUser, dbPass)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to database")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func transferHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// VULNERABILITY: No authentication/authorization check (CWE-306)
	// Anyone can initiate a transfer for any user

	// VULNERABILITY: No input validation (CWE-20)
	// Negative amounts could reverse transfers

	// VULNERABILITY: No rate limiting (CWE-770)

	// VULNERABILITY: SQL Injection via string formatting (CWE-89)
	query := fmt.Sprintf(
		"INSERT INTO transactions (from_user_id, to_user_id, amount, description) VALUES (%d, %d, %f, '%s') RETURNING id",
		req.FromUserID, req.ToUserID, req.Amount, req.Description,
	)

	var txID int
	err := db.QueryRow(query).Scan(&txID)
	if err != nil {
		// VULNERABILITY: Verbose error disclosure (CWE-209)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TransferResponse{Error: fmt.Sprintf("Database error: %v", err)})
		return
	}

	// VULNERABILITY: No balance check — overdraft possible (business logic flaw)
	updateQuery := fmt.Sprintf(
		"UPDATE users SET balance = balance - %f WHERE id = %d; UPDATE users SET balance = balance + %f WHERE id = %d",
		req.Amount, req.FromUserID, req.Amount, req.ToUserID,
	)
	_, err = db.Exec(updateQuery)
	if err != nil {
		log.Printf("Balance update failed: %v", err)
	}

	// VULNERABILITY: Logging sensitive transaction data (CWE-532)
	log.Printf("Transfer: user %d -> user %d, amount: %f, desc: %s",
		req.FromUserID, req.ToUserID, req.Amount, req.Description)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TransferResponse{
		Message: "Transfer successful",
		TxID:    txID,
	})
}

func transactionsHandler(w http.ResponseWriter, r *http.Request) {
	// VULNERABILITY: No authentication (CWE-306)
	// VULNERABILITY: Returns all transactions for all users (CWE-200)
	rows, err := db.Query("SELECT id, from_user_id, to_user_id, amount, description FROM transactions ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transactions []map[string]interface{}
	for rows.Next() {
		var id, fromID, toID int
		var amount float64
		var desc string
		rows.Scan(&id, &fromID, &toID, &amount, &desc)
		transactions = append(transactions, map[string]interface{}{
			"id": id, "from_user_id": fromID, "to_user_id": toID,
			"amount": amount, "description": desc,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

func main() {
	initDB()

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/transfer", transferHandler)
	http.HandleFunc("/transactions", transactionsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Payments service starting on :%s", port)
	// VULNERABILITY: No TLS (CWE-319)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
