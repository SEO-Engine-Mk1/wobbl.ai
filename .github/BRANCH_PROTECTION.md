# Branch Protection Rules for Wobbl.ai Platform

## Main Branch Protection

### Required Status Checks
- [x] Require branches to be up to date before merging
- [x] Require status checks to pass before merging
  - [x] lint-and-test (frontend)
  - [x] lint-and-test (backend)
  - [x] build (frontend)
  - [x] build (backend)
  - [x] security-scan
  - [x] code-quality

### Enforcements
- [x] Require pull request reviews before merging
  - [x] Required approving reviews: 1
  - [x] Dismiss stale PR approvals when new commits are pushed
  - [x] Require review from Code Owners
  - [x] Restrict reviews to users who dismiss stale PR approvals
  - [x] Require review from CODEOWNERS

### Restrictions
- [x] Limit who can push to matching branches
  - [x] Include administrators
  - [x] Restrict pushes to maintainers and admins

### Additional Rules
- [x] Do not allow bypassing the above settings
- [x] Require linear history
- [x] Allow force pushes (for maintainers only)

## Staging Branch Protection

### Required Status Checks
- [x] Require branches to be up to date before merging
- [x] Require status checks to pass before merging
  - [x] lint-and-test (frontend)
  - [x] lint-and-test (backend)
  - [x] build (frontend)
  - [x] build (backend)

### Enforcements
- [x] Require pull request reviews before merging
  - [x] Required approving reviews: 1

## Feature Branch Strategy

### Branch Naming Convention
- `feature/description-of-feature`
- `fix/description-of-bug-fix`
- `hotfix/critical-bug-fix`
- `docs/documentation-updates`
- `refactor/code-refactoring`

### Merge Strategy
1. Create feature branch from `main`
2. Develop and test locally
3. Create PR to `staging` for review
4. After approval, merge to `staging`
5. Test in staging environment
6. Create PR from `staging` to `main`
7. Final review and merge to `main`
8. Deploy to production

### Release Process
1. All features must be tested in staging
2. Release notes must be updated
3. Version bump in package.json
4. Tag release with version number
5. Deploy to production
6. Monitor for issues

## CODEOWNERS Configuration

```
# Global owners
* @SEO-Engine-Mk1

# Frontend code
/frontend/ @frontend-team
frontend/src/components/ @ui-team
frontend/src/app/ @frontend-team

# Backend code
/backend/ @backend-team
backend/src/api/ @api-team
backend/src/services/ @backend-team

# Infrastructure
.github/ @devops-team
docker-compose.yml @devops-team

# Documentation
docs/ @docs-team
README.md @docs-team
```