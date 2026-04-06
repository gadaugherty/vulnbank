"""VulnBank Auth API — DELIBERATELY VULNERABLE for DevSecOps demonstration."""

import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import psycopg2

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

# VULNERABILITY: Hardcoded database credentials (CWE-798)
DB_HOST = "postgres"
DB_NAME = "vulnbank"
DB_USER = "admin"
DB_PASS = "admin123"  # Hardcoded credential

# VULNERABILITY: Hardcoded JWT secret (CWE-798)
JWT_SECRET = "supersecret123"


def get_db():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    conn = get_db()
    cur = conn.cursor()
    try:
        # VULNERABILITY: SQL Injection (CWE-89)
        # User input directly interpolated into query
        query = f"INSERT INTO users (username, password, email) VALUES ('{username}', '{password}', '{email}')"
        cur.execute(query)
        conn.commit()
        return jsonify({"message": "User registered"}), 201
    except Exception as e:
        conn.rollback()
        # VULNERABILITY: Verbose error disclosure (CWE-209)
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()
    try:
        # VULNERABILITY: SQL Injection (CWE-89)
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
        cur.execute(query)
        user = cur.fetchone()

        if user:
            # VULNERABILITY: No token expiration (CWE-613)
            # VULNERABILITY: Hardcoded JWT secret (CWE-798)
            token = jwt.encode(
                {"user": username, "role": "user"},
                JWT_SECRET,
                algorithm="HS256",
            )
            # VULNERABILITY: Logging sensitive data (CWE-532)
            logging.info(f"User {username} logged in with password {password}")
            return jsonify({"token": token})
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        cur.close()
        conn.close()


@app.route("/users", methods=["GET"])
def get_users():
    # VULNERABILITY: No authentication check (CWE-306)
    # VULNERABILITY: Exposes all user data including passwords (CWE-200)
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, username, password, email FROM users")
        users = cur.fetchall()
        return jsonify(
            [
                {"id": u[0], "username": u[1], "password": u[2], "email": u[3]}
                for u in users
            ]
        )
    finally:
        cur.close()
        conn.close()


@app.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):
    # VULNERABILITY: IDOR — no auth check, direct object reference (CWE-639)
    conn = get_db()
    cur = conn.cursor()
    try:
        # VULNERABILITY: SQL Injection (CWE-89)
        query = f"SELECT id, username, email, balance FROM users WHERE id={user_id}"
        cur.execute(query)
        user = cur.fetchone()
        if user:
            return jsonify(
                {"id": user[0], "username": user[1], "email": user[2], "balance": str(user[3])}
            )
        return jsonify({"error": "User not found"}), 404
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    # VULNERABILITY: Debug mode enabled in production (CWE-489)
    app.run(host="0.0.0.0", port=5000, debug=True)
