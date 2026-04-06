## What does this PR do?


## Security Checklist

- [ ] No secrets or credentials in code
- [ ] Input validation on user-facing endpoints
- [ ] Parameterized queries for database operations
- [ ] Error messages don't leak internal details
- [ ] New dependencies reviewed for known vulnerabilities
- [ ] Container changes maintain non-root user
- [ ] Terraform changes reviewed for public access / overpermissive IAM

## If this PR changes auth, authz, or data handling:
- [ ] Security team tagged for review (see CODEOWNERS)

## Testing
- [ ] Security pipeline passes (🚦 Security Gate)
