"""VulnBank Auth API — SECURED version."""

import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import psycopg2
from psycopg2 import sql as psql
import hashlib
import hmac
import random

app = Flask(__name__)
CORS(app, origins=[os.environ.get("ALLOWED_ORIGIN", "http://localhost:3000")])

# Structured logging without sensitive data
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# FIX: Credentials from environment variables, not hardcoded
DB_HOST = os.environ.get("DB_HOST", "postgres")
DB_NAME = os.environ.get("DB_NAME", "vulnbank")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")

# FIX: JWT secret from environment, not hardcoded
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 1

if not all([DB_USER, DB_PASS, JWT_SECRET]):
    raise RuntimeError("Required environment variables not set: DB_USER, DB_PASS, JWT_SECRET")


def get_db():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        sslmode="require",
    )


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Hash password with PBKDF2-HMAC-SHA256."""
    if salt is None:
        salt = os.urandom(32).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
    return dk.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Constant-time password comparison."""
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
    return hmac.compare_digest(dk.hex(), stored_hash)




def generate_account_number():
    """Generate a unique account number."""
    return f"4821-{random.randint(1000,9999)}-{random.randint(1000,9999)}"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email = data.get("email", "").strip()

    # FIX: Input validation
    if not username or not password or not email:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    # FIX: Hash password before storage
    pw_hash, salt = hash_password(password)

    conn = get_db()
    cur = conn.cursor()
    try:
        # FIX: Parameterized query — prevents SQL injection
        cur.execute(
            "INSERT INTO users (username, password_hash, password_salt, email, account_number) VALUES (%s, %s, %s, %s, %s)",
            (username, pw_hash, salt, email, generate_account_number()),
        )
        conn.commit()
        logger.info("User registered: %s", username)
        return jsonify({"message": "User registered"}), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "Username already exists"}), 409
    except Exception:
        conn.rollback()
        # FIX: Generic error message — no internal details leaked
        logger.exception("Registration failed")
        return jsonify({"error": "Registration failed"}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        # FIX: Parameterized query — prevents SQL injection
        cur.execute(
            "SELECT id, username, password_hash, password_salt FROM users WHERE username = %s",
            (username,),
        )
        user = cur.fetchone()

        if user and verify_password(password, user[2], user[3]):
            # FIX: Token has expiration (CWE-613 remediated)
            # FIX: Secret from environment (CWE-798 remediated)
            token = jwt.encode(
                {
                    "sub": user[0],
                    "user": user[1],
                    "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
                    "iat": datetime.utcnow(),
                },
                JWT_SECRET,
                algorithm=JWT_ALGORITHM,
            )
            # FIX: No sensitive data in logs
            logger.info("Login successful: user_id=%d", user[0])
            return jsonify({"token": token})
        else:
            # FIX: Generic message — doesn't reveal whether user exists
            logger.warning("Failed login attempt for username: %s", username)
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        cur.close()
        conn.close()


def require_auth(f):
    """Decorator to require valid JWT token."""
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization required"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)

    return decorated


@app.route("/users", methods=["GET"])
@require_auth
def get_users():
    # FIX: Requires authentication
    # FIX: Only returns non-sensitive fields
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, username, email, account_number FROM users")
        users = cur.fetchall()
        return jsonify(
            [{"id": u[0], "username": u[1], "email": u[2], "account_number": u[3]} for u in users]
        )
    finally:
        cur.close()
        conn.close()


@app.route("/user/<int:user_id>", methods=["GET"])
@require_auth
def get_user(user_id):
    # FIX: Requires authentication
    # FIX: Type-safe parameter (int:user_id) prevents injection
    # FIX: Authorization check — users can only view their own data
    if request.user["sub"] != user_id:
        return jsonify({"error": "Forbidden"}), 403

    conn = get_db()
    cur = conn.cursor()
    try:
        # FIX: Parameterized query
        cur.execute(
            "SELECT id, username, email, balance, account_number FROM users WHERE id = %s",
            (user_id,),
        )
        user = cur.fetchone()
        if user:
            return jsonify(
                {"id": user[0], "username": user[1], "email": user[2], "balance": str(user[3]), "account_number": user[4]}
            )
        return jsonify({"error": "User not found"}), 404
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    # FIX: Debug mode disabled
    app.run(host="0.0.0.0", port=5000, debug=False)
