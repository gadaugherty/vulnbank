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
	dbHost = "localhost"
	dbName = "vulnbank"
	dbUser = "admin"
	dbPass = "admin123"
)

var db *sql.DB

type TransferRequest struct {
	FromAccount string  `json:"from_account"`
	ToAccount   string  `json:"to_account"`
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
		"INSERT INTO transactions (from_account, to_account, amount, description) VALUES ('%s', '%s', %f, '%s') RETURNING id",
		req.FromAccount, req.ToAccount, req.Amount, req.Description,
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
		"UPDATE users SET balance = balance - %f WHERE account_number = '%s'; UPDATE users SET balance = balance + %f WHERE account_number = '%s'",
		req.Amount, req.FromAccount, req.Amount, req.ToAccount,
	)
	_, err = db.Exec(updateQuery)
	if err != nil {
		log.Printf("Balance update failed: %v", err)
	}

	// VULNERABILITY: Logging sensitive transaction data (CWE-532)
	log.Printf("Transfer: %s -> %s, amount: %f, desc: %s",
		req.FromAccount, req.ToAccount, req.Amount, req.Description)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TransferResponse{
		Message: "Transfer successful",
		TxID:    txID,
	})
}

func transactionsHandler(w http.ResponseWriter, r *http.Request) {
	// VULNERABILITY: No authentication (CWE-306)
	// VULNERABILITY: Returns all transactions for all users (CWE-200)
	rows, err := db.Query("SELECT id, from_account, to_account, amount, description, status FROM transactions ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transactions []map[string]interface{}
	for rows.Next() {
		var id int
		var fromAcct, toAcct, desc, status string
		var amount float64
		rows.Scan(&id, &fromAcct, &toAcct, &amount, &desc, &status)
		transactions = append(transactions, map[string]interface{}{
			"id": id, "from_account": fromAcct, "to_account": toAcct,
			"amount": amount, "description": desc, "status": status,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}


func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	initDB()

	http.HandleFunc("/health", corsMiddleware(healthHandler))
	http.HandleFunc("/transfer", corsMiddleware(transferHandler))
	http.HandleFunc("/transactions", corsMiddleware(transactionsHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Payments service starting on :%s", port)
	// VULNERABILITY: No TLS (CWE-319)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
