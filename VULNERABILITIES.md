# VulnBank — Vulnerability Catalog

Every vulnerability in this project was **deliberately planted** to demonstrate detection and remediation.
This is the "before" state (branch: `main-insecure`). The "after" state is on `main-secure`.

---

## Application Layer

### VULN-001: SQL Injection (Critical)
- **CWE:** [CWE-89](https://cwe.mitre.org/data/definitions/89.html)
- **Location:** `auth-api/app.py` — `/login`, `/register`, `/user/<id>` endpoints
- **Location:** `payments/main.go` — `/transfer` endpoint
- **What:** User input directly interpolated into SQL queries via f-strings / `fmt.Sprintf`
- **Impact:** Full database access — read all users, modify balances, drop tables
- **Detection:** Semgrep rule `python.sqlalchemy.security.sqlalchemy-execute-raw-query`, gosec G201
- **Fix:** Parameterized queries (`%s` placeholders in Python, `$1` in Go)
- **Branch diff:** Compare `auth-api/app.py` between `main-insecure` and `main-secure`

### VULN-002: Hardcoded JWT Secret (Critical)
- **CWE:** [CWE-798](https://cwe.mitre.org/data/definitions/798.html)
- **Location:** `auth-api/app.py` — `JWT_SECRET = "supersecret123"`
- **What:** JWT signing secret is hardcoded in source code
- **Impact:** Anyone who reads the code can forge valid tokens for any user
- **Detection:** Gitleaks (entropy + regex), custom Semgrep rule `vulnbank-no-hardcoded-jwt-secret`
- **Fix:** `os.environ["JWT_SECRET"]` — sourced from Kubernetes Secret / Vault

### VULN-003: Hardcoded Database Credentials (Critical)
- **CWE:** [CWE-798](https://cwe.mitre.org/data/definitions/798.html)
- **Location:** `auth-api/app.py`, `payments/main.go`
- **What:** `DB_PASS = "admin123"` hardcoded in application code
- **Impact:** Database credentials in version control, accessible to anyone with repo access
- **Detection:** Gitleaks, custom Semgrep rule `vulnbank-no-hardcoded-db-password`
- **Fix:** Environment variables populated from Kubernetes Secrets

### VULN-004: Plaintext Password Storage (High)
- **CWE:** [CWE-256](https://cwe.mitre.org/data/definitions/256.html)
- **Location:** `db/init.sql`, `auth-api/app.py`
- **What:** Passwords stored in plaintext in the database
- **Impact:** Database breach exposes all user passwords directly
- **Detection:** Semgrep pattern matching on INSERT with plain password field
- **Fix:** PBKDF2-HMAC-SHA256 hashing with per-user salt

### VULN-005: Missing Authentication (High)
- **CWE:** [CWE-306](https://cwe.mitre.org/data/definitions/306.html)
- **Location:** `auth-api/app.py` — `/users` endpoint; `payments/main.go` — `/transfer`, `/transactions`
- **What:** Endpoints that should require authentication are publicly accessible
- **Impact:** Anyone can view all users, initiate transfers, view all transactions
- **Detection:** Manual code review, custom Semgrep rules could catch missing decorators
- **Fix:** JWT authentication middleware on all sensitive endpoints

### VULN-006: Insecure Direct Object Reference — IDOR (High)
- **CWE:** [CWE-639](https://cwe.mitre.org/data/definitions/639.html)
- **Location:** `auth-api/app.py` — `/user/<user_id>`; `frontend/src/components/Transfer.js`
- **What:** Users can access any user's data or transfer from any account by changing IDs
- **Impact:** Horizontal privilege escalation — access or modify any user's account
- **Detection:** Manual review (hard to catch with SAST)
- **Fix:** Authorization check: `request.user["sub"] != user_id` returns 403

### VULN-007: Cross-Site Scripting — XSS (Medium)
- **CWE:** [CWE-79](https://cwe.mitre.org/data/definitions/79.html)
- **Location:** `frontend/src/components/UserSearch.js` — `dangerouslySetInnerHTML`
- **What:** API response rendered as raw HTML using React's `dangerouslySetInnerHTML`
- **Impact:** Attacker-controlled data could execute JavaScript in victim's browser
- **Detection:** Semgrep `react.dangerously-set-inner-html`
- **Fix:** Use text content rendering: `{userData.balance}` instead of `dangerouslySetInnerHTML`

### VULN-008: Verbose Error Disclosure (Medium)
- **CWE:** [CWE-209](https://cwe.mitre.org/data/definitions/209.html)
- **Location:** `auth-api/app.py`, `payments/main.go`
- **What:** Internal error details (stack traces, SQL errors) returned to client
- **Impact:** Reveals database structure, file paths, technology stack to attackers
- **Fix:** Generic error messages to client, detailed logging server-side only

### VULN-009: Flask Debug Mode in Production (Medium)
- **CWE:** [CWE-489](https://cwe.mitre.org/data/definitions/489.html)
- **Location:** `auth-api/app.py` — `app.run(debug=True)`
- **What:** Werkzeug debugger enabled, accessible via browser
- **Impact:** Remote code execution via debugger console
- **Detection:** Custom Semgrep rule `vulnbank-no-flask-debug`
- **Fix:** `debug=False`, use gunicorn in production

### VULN-010: JWT Without Expiration (Medium)
- **CWE:** [CWE-613](https://cwe.mitre.org/data/definitions/613.html)
- **Location:** `auth-api/app.py` — token generation in `/login`
- **What:** JWT tokens have no `exp` claim — they never expire
- **Impact:** Stolen token grants permanent access
- **Fix:** Add `exp: datetime.utcnow() + timedelta(hours=1)` to JWT payload

### VULN-011: Sensitive Data in Logs (Low)
- **CWE:** [CWE-532](https://cwe.mitre.org/data/definitions/532.html)
- **Location:** `auth-api/app.py`, `payments/main.go`
- **What:** Passwords, transaction amounts, and user data logged in plaintext
- **Impact:** Log aggregation systems become a treasure trove for attackers
- **Fix:** Log only IDs and non-sensitive metadata

---

## Infrastructure Layer

### VULN-012: Public S3 Bucket (Critical)
- **CWE:** [CWE-732](https://cwe.mitre.org/data/definitions/732.html)
- **Checkov IDs:** CKV_AWS_18, CKV_AWS_19, CKV_AWS_21, CKV_AWS_53-56
- **Location:** `terraform/s3.tf`
- **What:** S3 bucket with `public-read` ACL, no encryption, no versioning
- **Impact:** Anyone on the internet can read user data
- **Fix:** Public access block, KMS encryption, versioning, access logging

### VULN-013: Publicly Accessible RDS (Critical)
- **Checkov ID:** CKV_AWS_17
- **Location:** `terraform/rds.tf`
- **What:** `publicly_accessible = true` with no encryption, default credentials
- **Impact:** Database directly accessible from internet
- **Fix:** Private subnet, encryption at rest, deletion protection, monitoring

### VULN-014: Open Security Groups (High)
- **Checkov IDs:** CKV_AWS_24, CKV_AWS_25
- **Location:** `terraform/network.tf`
- **What:** Security group allows all inbound/outbound traffic (0.0.0.0/0)
- **Impact:** No network-level access control
- **Fix:** Restrictive security groups per service, VPC flow logs

### VULN-015: Wildcard IAM Policies (High)
- **CWE:** [CWE-250](https://cwe.mitre.org/data/definitions/250.html)
- **Location:** `terraform/iam.tf`
- **What:** `AdministratorAccess` on node role, `s3:*` on all resources, wildcard principal
- **Impact:** Compromised node = full AWS account access
- **Fix:** Least-privilege policies: specific actions on specific resources

### VULN-016: EKS Public Endpoint (High)
- **Checkov IDs:** CKV_AWS_37, CKV_AWS_38, CKV_AWS_58
- **Location:** `terraform/eks.tf`
- **What:** Public API endpoint, no secrets encryption, no logging
- **Impact:** Kubernetes API accessible from internet, secrets stored unencrypted
- **Fix:** Private endpoint, KMS encryption for secrets, full audit logging

---

## Container Layer

### VULN-017: Running as Root (High)
- **CWE:** [CWE-250](https://cwe.mitre.org/data/definitions/250.html)
- **Location:** All three Dockerfiles (`auth-api/`, `payments/`, `frontend/`)
- **What:** `USER root` — container processes run as UID 0
- **Impact:** Container escape + root = host-level access
- **Detection:** Trivy, custom Semgrep rule `vulnbank-no-root-dockerfile`, Hadolint
- **Fix:** Distroless nonroot (Go), dedicated appuser (Python), nginx-unprivileged (Frontend)

### VULN-018: Overly Permissive File Permissions (Medium)
- **CWE:** [CWE-732](https://cwe.mitre.org/data/definitions/732.html)
- **Location:** All Dockerfiles — `chmod 777 /app`
- **What:** World-writable application directory
- **Impact:** Any process can modify application code at runtime
- **Detection:** Custom Semgrep rule `vulnbank-no-chmod-777`, Hadolint
- **Fix:** `chmod 755` for directories, `644` for files

### VULN-019: Unpinned Base Images (Medium)
- **CWE:** [CWE-1104](https://cwe.mitre.org/data/definitions/1104.html)
- **Location:** All Dockerfiles
- **What:** Using `python:3.9`, `golang:1.22`, `node:18` — mutable tags
- **Impact:** Builds are non-reproducible, supply chain risk
- **Fix:** Pinned slim/alpine images, multi-stage builds, distroless for runtime

---

## Kubernetes Layer

### VULN-020: Secrets in Plain Environment Variables (High)
- **CWE:** [CWE-798](https://cwe.mitre.org/data/definitions/798.html)
- **Location:** `kubernetes/base/auth-api.yml`, `payments.yml`, `postgres.yml`
- **What:** Database passwords and JWT secrets as plain `value:` in deployment YAML
- **Impact:** Secrets visible in `kubectl describe pod`, stored in etcd unencrypted
- **Fix:** Kubernetes Secrets with `secretKeyRef`, External Secrets Operator for production

### VULN-021: Privileged Containers (Critical)
- **CWE:** [CWE-250](https://cwe.mitre.org/data/definitions/250.html)
- **Location:** `kubernetes/base/payments.yml` — `privileged: true`
- **What:** Container has full access to host's devices and kernel
- **Impact:** Effectively removes container isolation entirely
- **Detection:** Trivy config scan, Kyverno `disallow-privileged-containers` policy
- **Fix:** `privileged: false`, `allowPrivilegeEscalation: false`, drop ALL capabilities

### VULN-022: No Resource Limits (Medium)
- **CWE:** [CWE-770](https://cwe.mitre.org/data/definitions/770.html)
- **Location:** All Kubernetes deployments
- **What:** No CPU/memory requests or limits set
- **Impact:** Single pod can consume all node resources (noisy neighbor / DoS)
- **Detection:** Kyverno `require-resource-limits` policy
- **Fix:** Set appropriate requests and limits based on load testing

### VULN-023: No Network Policies (Medium)
- **Location:** `kubernetes/base/` — no NetworkPolicy resources
- **What:** All pods can communicate with all other pods
- **Impact:** Compromised frontend can directly query database
- **Fix:** Default-deny NetworkPolicy + explicit allow rules per service pair

### VULN-024: LoadBalancer Services (Low)
- **Location:** `kubernetes/base/auth-api.yml`, `payments.yml`
- **What:** Internal APIs exposed directly via LoadBalancer
- **Impact:** APIs accessible from internet without going through ingress/WAF
- **Fix:** ClusterIP services, expose only frontend via Ingress with TLS
