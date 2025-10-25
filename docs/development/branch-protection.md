# Branch Protection Configuration

This document outlines the branch protection rules and conventions for the SEO Engine project.

## Branch Protection Rules

### Main Branch (`main`)
- **Protection Level**: 🔒 Highly Protected
- **Required Status Checks**:
  - `lint` - Code linting and formatting
  - `test` - Unit and integration tests
  - `build` - Build verification
  - `security-scan` - Security vulnerability scan
- **Required Reviews**: 
  - Minimum 1 code review
  - Require review from code owners
- **Restrictions**:
  - No direct pushes allowed
  - Force pushes disabled
  - Deletions not allowed
- **Merge Strategy**: 
  - Squash and merge required
  - Allow merge commits: No
  - Allow rebase merging: No

### Staging Branch (`staging`)
- **Protection Level**: 🔒 Moderately Protected
- **Required Status Checks**:
  - `lint` - Code linting and formatting
  - `test` - Unit and integration tests
- **Required Reviews**: 
  - Minimum 1 code review
- **Restrictions**:
  - Force pushes disabled
  - Deletions not allowed
- **Merge Strategy**: 
  - Create merge commit
  - Allow squash and merge: Yes
  - Allow rebase merging: Yes

## Branch Naming Conventions

### Feature Branches
```
feature/<module>/<description>
feature/serp/keyword-analysis
feature/article-generation/eeat-validation
feature/social/linkedin-integration
```

### Bugfix Branches
```
bugfix/<module>/<description>
bugfix/wordpress/media-upload
bugfix/frontend/dashboard-layout
bugfix/api/authentication-flow
```

### Hotfix Branches
```
hotfix/<severity>/<description>
hotfix/critical/security-vulnerability
hotfix/high/payment-processing
hotfix/medium/ui-glitch
```

### Release Branches
```
release/v<version>
release/v0.1.0
release/v0.2.0
```

## Workflow Rules

### Creating Feature Branches
1. Always create from `main` branch
2. Use descriptive names following conventions
3. Create corresponding GitHub issue
4. Link issue to pull request

### Pull Request Process
1. **Draft PR**: Create draft PR early for visibility
2. **Self-Review**: Review your own changes first
3. **Tests**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Review**: Request review from team members
6. **Approval**: Wait for approval before merge
7. **Merge**: Merge using approved strategy

### Code Review Guidelines
- **Functionality**: Does it work as expected?
- **Code Quality**: Is it clean and maintainable?
- **Performance**: Are there performance implications?
- **Security**: Are there security concerns?
- **Testing**: Is there adequate test coverage?
- **Documentation**: Is the code well documented?

## Automated Checks

### Pre-commit Hooks
- ESLint validation
- Prettier formatting
- TypeScript compilation
- Unit test execution

### CI/CD Pipeline
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Build**: `npm run build`
- **Security**: `npm audit`
- **Coverage**: Minimum 80% coverage required

### Status Checks
- ✅ `lint` - Code passes linting rules
- ✅ `test` - All tests pass
- ✅ `build` - Build completes successfully
- ✅ `security-scan` - No high-severity vulnerabilities
- ✅ `coverage` - Test coverage meets requirements

## Merge Strategies

### Main Branch (`main`)
- **Strategy**: Squash and merge
- **Reason**: Clean commit history
- **Process**: 
  1. All commits are squashed into one
  2. PR title becomes commit message
  3. PR description is preserved

### Staging Branch (`staging`)
- **Strategy**: Create merge commit
- **Reason**: Preserve feature branch history
- **Process**:
  1. Merge commit is created
  2. All feature commits are preserved
  3. Branch history remains intact

## Release Process

### Pre-release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Staging deployment verified

### Release Steps
1. Create release branch: `git checkout -b release/vX.X.X`
2. Update version numbers
3. Update changelog
4. Create pull request to `main`
5. Merge after approval
6. Create Git tag: `git tag vX.X.X`
7. Deploy to production
8. Merge `main` to `staging`

## Emergency Procedures

### Hotfix Process
1. Create hotfix branch from `main`: `git checkout -b hotfix/critical/issue`
2. Implement fix
3. Create PR to `main`
4. Bypass normal review process for critical issues
5. Merge and deploy immediately
6. Create retrospective issue

### Rollback Process
1. Identify problematic commit
2. Create rollback branch: `git checkout -b rollback/vX.X.X`
3. Revert problematic changes
4. Deploy rollback version
5. Investigate root cause
6. Create proper fix

## Tools and Automation

### GitHub Actions
- Branch protection enforcement
- Automated status checks
- PR templates and validation
- Issue templates

### Scripts
- Branch creation helper
- PR validation script
- Release automation
- Rollback automation

### Monitoring
- Branch protection violations
- Merge conflicts
- PR aging
- Deployment status

## Best Practices

### Branch Hygiene
- Keep branches up to date with `main`
- Delete merged branches regularly
- Use descriptive commit messages
- Avoid large, monolithic PRs

### Collaboration
- Communicate branch intentions
- Review PRs promptly
- Provide constructive feedback
- Document decisions and trade-offs

### Security
- Never commit secrets or API keys
- Use environment variables
- Regular security audits
- Follow secure coding practices

## Enforcement

### Automated Enforcement
- GitHub branch protection rules
- CI/CD pipeline requirements
- Pre-commit hooks
- Automated PR validation

### Manual Enforcement
- Code review process
- Team lead approval for critical changes
- Regular branch audits
- Team training and guidelines

## Troubleshooting

### Common Issues
- **Branch protection bypass**: Contact team lead
- **Failed status checks**: Check CI/CD logs
- **Merge conflicts**: Resolve in feature branch
- **PR stuck in review**: Escalate to team lead

### Getting Help
- Check this documentation
- Review GitHub issues
- Contact team maintainers
- Create discussion for questions