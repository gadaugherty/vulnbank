# VulnBank — DevSecOps Pipeline Reference Implementation

A multi-service fintech application with a complete security pipeline.
Not a tutorial — a set of engineering decisions with documented tradeoffs.

## What This Is

VulnBank is a deliberately vulnerable microservices application that demonstrates:

1. **Real vulnerability classes** across application, infrastructure, container, and Kubernetes layers
2. **A complete CI/CD security pipeline** that catches them all
3. **Documented remediations** with before/after comparisons
4. **Architecture decisions** explaining _why_, not just _what_

Two branches tell the story:
- **`main-insecure`** — 24 intentionally planted vulnerabilities ([full catalog](VULNERABILITIES.md))
- **`main-secure`** — Every vulnerability remediated with documented fixes

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  VulnBank                                            │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │ Frontend  │──▶│ Auth API │──▶│ Payments │        │
│  │ (React)   │   │ (Python) │   │ (Go)     │        │
│  └──────────┘   └──────────┘   └──────────┘        │
│       │               │              │               │
│       └───────────────┴──────────────┘               │
│                       │                              │
│                ┌──────────┐                          │
│                │ Postgres  │                          │
│                └──────────┘                          │
│                                                      │
│  Infra: Terraform → AWS (EKS, RDS, S3)              │
│  CI/CD: GitHub Actions                               │
│  Policy: Kyverno admission control                   │
│  GitOps: Branch protection as Terraform              │
└──────────────────────────────────────────────────────┘
```

**Why this stack:**
- **Multiple languages** (Python + Go + JS) → proves SCA/SAST isn't one-size-fits-all
- **Kubernetes** → most DevSecOps roles involve it
- **Terraform** → IaC scanning is table stakes
- **GitHub Actions** → most common CI, interviewers can read it immediately

## Architecture Decision Records

| Decision | Choice | Alternatives Considered | Why |
|----------|--------|------------------------|-----|
| SAST | Semgrep | CodeQL, Bandit, gosec | Multi-language, custom rules in writable pattern syntax, fast. CodeQL is better for compiled languages. Bandit is Python-only. |
| SAST (Go) | gosec | Semgrep, CodeQL | Go-native, understands Go idioms. Runs alongside Semgrep. |
| SCA | Trivy | Snyk, Grype, Dependabot | Single tool for SCA + containers + IaC. Free. SARIF output. |
| Secret Detection | Gitleaks | TruffleHog, detect-secrets | Lower false-positive rate. Combined regex + entropy detection. TruffleHog is better for historical scanning. |
| Container Base | Distroless | Alpine, Scratch | No shell, no package manager, nonroot default. Tradeoff: can't exec in for debugging — use `kubectl debug` instead. |
| Container Base (Python) | python:slim | Distroless, Alpine | Python needs glibc; Alpine uses musl (compatibility issues). Slim is minimal + compatible. |
| Container Base (Frontend) | nginx-unprivileged | Node, Alpine+nginx | 40MB vs 900MB. Already runs as non-root. Serves static files only. |
| IaC Scanning | Checkov | tfsec (now Trivy), Terrascan | Custom Python policies. Covers TF, K8s, Dockerfiles. tfsec was absorbed into Trivy. |
| Admission Control | Kyverno | OPA/Gatekeeper | YAML-native policies, lower learning curve. OPA requires Rego language. Either works. |
| SBOM Format | SPDX | CycloneDX | ISO standard (ISO/IEC 5962:2021). CycloneDX is OWASP-backed and better for vuln correlation. |
| Password Hashing | PBKDF2-HMAC-SHA256 | bcrypt, Argon2 | Available in Python stdlib (no extra deps). Argon2 is stronger but requires native extension. |

## Security Findings Summary

| # | Vulnerability | Layer | Severity | Detection Tool | Remediation |
|---|--------------|-------|----------|---------------|-------------|
| 1 | SQL Injection | App | Critical | Semgrep, gosec | Parameterized queries |
| 2 | Hardcoded JWT Secret | App | Critical | Gitleaks, Semgrep | Environment variable |
| 3 | Hardcoded DB Credentials | App | Critical | Gitleaks, Semgrep | Environment variable |
| 4 | Plaintext Passwords | App | High | Code review | PBKDF2 hashing |
| 5 | Missing Authentication | App | High | Code review | JWT middleware |
| 6 | IDOR | App | High | Code review | Authorization checks |
| 7 | XSS | App | Medium | Semgrep | Text rendering (no innerHTML) |
| 8 | Error Disclosure | App | Medium | Semgrep | Generic error messages |
| 9 | Debug Mode | App | Medium | Semgrep | `debug=False` + gunicorn |
| 10 | No Token Expiry | App | Medium | Code review | JWT `exp` claim |
| 11 | Sensitive Logging | App | Low | Semgrep | Redact sensitive fields |
| 12 | Public S3 Bucket | Infra | Critical | Checkov | Public access block + KMS |
| 13 | Public RDS | Infra | Critical | Checkov | Private subnet + encryption |
| 14 | Open Security Groups | Infra | High | Checkov | Per-service restrictive SGs |
| 15 | Wildcard IAM | Infra | High | Checkov | Least-privilege policies |
| 16 | EKS Public Endpoint | Infra | High | Checkov | Private endpoint + KMS |
| 17 | Root Containers | Container | High | Trivy, Hadolint, Semgrep | Distroless nonroot / appuser |
| 18 | chmod 777 | Container | Medium | Semgrep, Hadolint | Restrictive permissions |
| 19 | Unpinned Images | Container | Medium | Trivy, Hadolint | Pinned slim/distroless |
| 20 | Secrets in Env Vars | K8s | High | Trivy config scan | Kubernetes Secrets + secretKeyRef |
| 21 | Privileged Containers | K8s | Critical | Trivy, Kyverno | `privileged: false` |
| 22 | No Resource Limits | K8s | Medium | Kyverno | CPU/memory requests + limits |
| 23 | No Network Policies | K8s | Medium | Trivy | Default-deny + explicit allow |
| 24 | LoadBalancer Services | K8s | Low | Code review | ClusterIP + Ingress |

See [VULNERABILITIES.md](VULNERABILITIES.md) for the full catalog with CWE references, exact file locations, and detailed remediation steps.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions Security Pipeline                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Secrets   │  │ SAST     │  │ SCA      │  │ Dockerfile   │   │
│  │ Gitleaks  │  │ Semgrep  │  │ Trivy FS │  │ Hadolint     │   │
│  │ (~15s)    │  │ gosec    │  │ + SBOM   │  │ (~10s)       │   │
│  │ BLOCK     │  │ (~45s)   │  │ (~30s)   │  │ WARN         │   │
│  └────┬─────┘  │ WARN     │  │ BLOCK    │  └──────────────┘   │
│       │        └──────────┘  └──────────┘                      │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                 │
│  │ Container │  │ IaC      │  │ K8s Config   │                 │
│  │ Trivy     │  │ Checkov  │  │ Trivy        │                 │
│  │ (~60s)    │  │ (~20s)   │  │ (~15s)       │                 │
│  │ BLOCK     │  │ WARN     │  │ WARN         │                 │
│  └──────────┘  └──────────┘  └──────────────┘                 │
│                         │                                       │
│                         ▼                                       │
│              ┌─────────────────┐                               │
│              │  Security Gate   │                               │
│              │  (pass/fail)     │                               │
│              └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Enforcement Policy

| Stage | Duration | Blocks PR? | Rationale |
|-------|----------|-----------|-----------|
| Secret Detection (Gitleaks) | ~15s | **Yes (always)** | Leaked secrets are immediately exploitable. No exceptions. |
| SAST (Semgrep + gosec) | ~45s | No (warning, 30-day ramp) | Blocking 200 findings on day one causes developer revolt. Triage first. |
| SCA (Trivy) | ~30s | **Yes (CRITICAL/HIGH)** | Known-exploitable dependency vulns are patchable. MEDIUM goes to triage. |
| Container Scan (Trivy) | ~60s | **Yes (CRITICAL only)** | HIGH in OS packages is often noise waiting on upstream. CRITICAL is actionable. |
| IaC Scan (Checkov) | ~20s | No (warning, 30-day ramp) | IaC findings often require architecture changes. Warn, ticket, then enforce. |
| K8s Config Scan (Trivy) | ~15s | No (warning) | Similar to IaC — needs deployment architecture changes. |
| Dockerfile Lint (Hadolint) | ~10s | No (warning) | Best practices, not security-critical. |
| **Total** | **~2.5 min** | | Parallelized. If this were 15 min, nobody would use it. |

### Why Warnings Before Blocks

> "If you block PRs on day one with 200 findings, developers will hate you and find workarounds.
> Triage first, then enforce."

The 30-day ramp strategy:
1. **Week 1-2:** Pipeline runs, all findings go to GitHub Security tab as warnings
2. **Week 2-3:** Triage existing findings, create tickets, mark false positives
3. **Week 4:** Promote SAST and IaC to blocking on new findings only

## Custom Semgrep Rules

We wrote 7 custom rules in `.semgrep/custom-rules.yml`:

| Rule | What It Catches | Why Custom |
|------|----------------|-----------|
| `vulnbank-no-hardcoded-jwt-secret` | `jwt.encode(payload, "literal", ...)` | Default Semgrep rules miss this pattern |
| `vulnbank-no-fstring-sql` | `db.execute(f"SELECT...")` | More specific than generic SQL injection rules |
| `vulnbank-no-flask-debug` | `app.run(debug=True)` | No default rule for this critical finding |
| `vulnbank-no-hardcoded-db-password` | `DB_PASS = "..."` | Catches variable naming patterns |
| `vulnbank-no-logging-passwords` | `logging.info(... + password + ...)` | Catches sensitive data in log calls |
| `vulnbank-no-root-dockerfile` | `USER root` | Catches explicit root in Dockerfiles |
| `vulnbank-no-chmod-777` | `RUN chmod 777 ...` | Catches world-writable permissions |

## Kyverno Admission Policies

5 policies in `kyverno/policies/` that enforce at deploy time:

| Policy | Action | What It Prevents |
|--------|--------|-----------------|
| `require-run-as-nonroot` | **Enforce** | Root containers |
| `disallow-privileged-containers` | **Enforce** | Privileged mode |
| `require-resource-limits` | **Enforce** | Unbounded resource consumption |
| `disallow-latest-tag` | **Enforce** | Non-reproducible deployments |
| `require-readonly-rootfs` | **Audit** | Writable root filesystem |

`require-readonly-rootfs` starts in Audit mode because some apps need writable temp dirs (solved with emptyDir volumes, but needs per-app testing first).

## Local Development

```bash
# Run all services locally
docker-compose up --build

# Services:
#   Frontend: http://localhost:3000
#   Auth API: http://localhost:5000
#   Payments: http://localhost:8080
#   Postgres: localhost:5432
```

## What I'd Do Differently in Production

- [ ] **DAST:** Add OWASP ZAP against staging on a schedule (not in PR pipeline — too slow, and scanning a build artifact is theater)
- [ ] **Image Signing:** Cosign signatures before deployment, verify in admission controller
- [ ] **Runtime Security:** Falco for anomaly detection (unexpected process execution, network connections)
- [ ] **Secrets Management:** External Secrets Operator pulling from AWS Secrets Manager or Vault
- [ ] **Alerting:** Slack/PagerDuty integration for critical CVE notifications from Dependabot
- [ ] **DAST in Staging:** OWASP ZAP on a nightly schedule against a staging environment
- [ ] **Compliance:** Map findings to SOC2/PCI-DSS controls for audit trail
- [ ] **SLA Tracking:** Mean time to remediate (MTTR) per severity level

## Project Structure

```
vulnbank/
├── .github/
│   ├── workflows/
│   │   └── security-pipeline.yml    # Full CI/CD security pipeline
│   └── CODEOWNERS                   # Security-sensitive path ownership
├── .semgrep/
│   └── custom-rules.yml             # 7 custom Semgrep rules
├── auth-api/                        # Python/Flask authentication service
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── payments/                        # Go payments service
│   ├── main.go
│   ├── go.mod
│   └── Dockerfile
├── frontend/                        # React frontend
│   ├── src/
│   ├── package.json
│   ├── nginx.conf                   # Security headers (secure branch)
│   └── Dockerfile
├── terraform/                       # AWS infrastructure as code
│   ├── main.tf
│   ├── eks.tf
│   ├── rds.tf
│   ├── s3.tf
│   ├── iam.tf
│   ├── network.tf
│   └── github.tf                    # Branch protection as IaC
├── kubernetes/base/                 # K8s deployment manifests
│   ├── auth-api.yml
│   ├── payments.yml
│   ├── frontend.yml
│   ├── postgres.yml
│   ├── secrets.yml                  # Secret references (secure branch)
│   └── network-policy.yml           # Network segmentation (secure branch)
├── kyverno/policies/                # Admission control policies
├── db/init.sql                      # Database schema
├── docker-compose.yml               # Local development
├── VULNERABILITIES.md               # Full vulnerability catalog (24 vulns)
└── README.md                        # This file
```
