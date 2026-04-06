# ─── GitHub Branch Protection — as IaC ──────────────────────
# This requires the GitHub Terraform provider and a PAT with repo admin access.
# It documents the branch protection policy as code, making it reproducible
# and auditable — not just a UI checkbox someone can silently change.

terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  # Token from environment: GITHUB_TOKEN
}

resource "github_repository" "vulnbank" {
  name        = "vulnbank"
  description = "DevSecOps Pipeline Reference Implementation"
  visibility  = "public"

  has_issues   = true
  has_projects = false
  has_wiki     = false

  vulnerability_alerts = true

  # WHY: Dependabot alerts are free and catch things between pipeline runs.
  # They're not a replacement for Trivy SCA in CI, but they provide
  # continuous monitoring vs. point-in-time scanning.
}

resource "github_branch_protection" "main" {
  repository_id = github_repository.vulnbank.node_id
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    # WHY dismiss_stale_reviews: If a PR is approved, then new commits
    # are pushed, the approval should be invalidated. Otherwise an attacker
    # could get approval on safe code, then push malicious code.
  }

  required_status_checks {
    strict   = true
    contexts = ["security-gate"]
    # WHY strict: Requires branch to be up-to-date before merging.
    # Prevents a race condition where two PRs are individually safe
    # but introduce a vulnerability when combined.
  }

  enforce_admins          = true
  require_signed_commits  = true
  required_linear_history = true
  allows_force_pushes     = false
  allows_deletions        = false

  # WHY enforce_admins: Admins are the most valuable targets.
  # If they can bypass protections, a compromised admin account
  # can push directly to main.

  # WHY require_signed_commits: Prevents commit spoofing.
  # Without signatures, anyone who knows your email can author
  # commits as you.

  # WHY required_linear_history: No merge commits = cleaner
  # git bisect, easier to understand what changed and when.
}

# CODEOWNERS file should exist at .github/CODEOWNERS
# This ensures security-sensitive paths require security team review
