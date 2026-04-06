// VulnBank Payments Service — SECURED version.
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	_ "github.com/lib/pq"
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
	// FIX: Credentials from environment variables
	dbHost := os.Getenv("DB_HOST")
	dbName := os.Getenv("DB_NAME")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")

	if dbHost == "" || dbName == "" || dbUser == "" || dbPass == "" {
		log.Fatal("Required environment variables not set: DB_HOST, DB_NAME, DB_USER, DB_PASS")
	}

	// FIX: Use SSL for database connection
	connStr := fmt.Sprintf("host=%s dbname=%s user=%s password=%s sslmode=require",
		dbHost, dbName, dbUser, dbPass)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	// FIX: Connection pool limits
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	log.Println("Connected to database")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// FIX: Authentication middleware
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"Authorization required"}`, http.StatusUnauthorized)
			return
		}
		// In production, validate JWT here. For this demo, we check token exists.
		next(w, r)
	}
}

func transferHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// FIX: Input validation
	if req.Amount <= 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Amount must be positive"})
		return
	}
	if req.FromUserID == req.ToUserID {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Cannot transfer to yourself"})
		return
	}
	if len(req.Description) > 500 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Description too long"})
		return
	}

	// FIX: Use transaction for atomicity + parameterized queries
	tx, err := db.Begin()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Internal server error"})
		return
	}
	defer tx.Rollback()

	// FIX: Check balance before transfer (prevents overdraft)
	var balance float64
	err = tx.QueryRow("SELECT balance FROM users WHERE id = $1 FOR UPDATE", req.FromUserID).Scan(&balance)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Source account not found"})
		return
	}
	if balance < req.Amount {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Insufficient funds"})
		return
	}

	// FIX: Parameterized query — prevents SQL injection
	var txID int
	err = tx.QueryRow(
		"INSERT INTO transactions (from_user_id, to_user_id, amount, description) VALUES ($1, $2, $3, $4) RETURNING id",
		req.FromUserID, req.ToUserID, req.Amount, req.Description,
	).Scan(&txID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		// FIX: Generic error message — no internal details
		json.NewEncoder(w).Encode(TransferResponse{Error: "Transfer failed"})
		return
	}

	// FIX: Parameterized balance updates within transaction
	_, err = tx.Exec("UPDATE users SET balance = balance - $1 WHERE id = $2", req.Amount, req.FromUserID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Transfer failed"})
		return
	}
	_, err = tx.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", req.Amount, req.ToUserID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Transfer failed"})
		return
	}

	if err = tx.Commit(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TransferResponse{Error: "Transfer failed"})
		return
	}

	// FIX: Log transaction ID only, no sensitive data
	log.Printf("Transfer completed: tx_id=%d from=%d to=%d", txID, req.FromUserID, req.ToUserID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TransferResponse{
		Message: "Transfer successful",
		TxID:    txID,
	})
}

func transactionsHandler(w http.ResponseWriter, r *http.Request) {
	// FIX: Parameterized query, limited fields
	rows, err := db.Query(
		"SELECT id, from_user_id, to_user_id, amount FROM transactions ORDER BY created_at DESC LIMIT 50",
	)
	if err != nil {
		http.Error(w, `{"error":"Internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transactions []map[string]interface{}
	for rows.Next() {
		var id, fromID, toID int
		var amount float64
		if err := rows.Scan(&id, &fromID, &toID, &amount); err != nil {
			continue
		}
		transactions = append(transactions, map[string]interface{}{
			"id": id, "from_user_id": fromID, "to_user_id": toID, "amount": amount,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

func main() {
	initDB()

	http.HandleFunc("/health", healthHandler)
	// FIX: Auth middleware on sensitive endpoints
	http.HandleFunc("/transfer", authMiddleware(transferHandler))
	http.HandleFunc("/transactions", authMiddleware(transactionsHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Payments service starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
