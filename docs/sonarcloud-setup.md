# SonarCloud Setup Guide - Engine Repository

This guide will help you set up SonarCloud integration for the Engine repository to enable automated code quality analysis.

## 🎯 What is SonarCloud?

SonarCloud is a cloud-based code quality and security service that integrates with GitHub to provide:
- **Code Quality Analysis**: Detect bugs, vulnerabilities, and code smells
- **Technical Debt Tracking**: Monitor and reduce technical debt
- **Coverage Reports**: Track test coverage across your codebase
- **Security Scanning**: Identify security vulnerabilities and hotspots
- **Pull Request Analysis**: Automated code review for every PR

## 📋 Prerequisites

- GitHub repository access (admin or maintainer role)
- SonarCloud account (free for open source projects)

## 🔧 Step-by-Step Setup

### 1. Create SonarCloud Account

1. Visit [https://sonarcloud.io](https://sonarcloud.io)
2. Click **"Sign up"** and choose **"Continue with GitHub"**
3. Authorize SonarCloud to access your GitHub account
4. Choose the appropriate plan:
   - **Free**: For public repositories and open source projects
   - **Paid**: For private repositories

### 2. Import Your GitHub Organization

1. After signing in, click **"+"** button to add a new organization
2. Select **"GitHub"** as the platform
3. Choose your GitHub organization (`SEO-Engine-Mk1`)
4. Install the SonarCloud GitHub App if prompted
5. Grant necessary permissions for repository access

### 3. Create SonarCloud Project

1. Click **"Add new project"** button
2. Select your repository: `SEO-Engine-Mk1/engine`
3. Choose your analysis method:
   - **"With GitHub Actions"** (Recommended)
   - **"Other CI"** (if using different CI/CD)

4. Select your build system:
   - **"Other"** (since we're using a custom setup with pnpm)

### 4. Generate SonarCloud Token

1. In your SonarCloud project, click on **"Your Project"** → **"Administration"**
2. Go to **"Pull Request Decoration"** section
3. Click **"Generate"** to create a new token
4. **Copy the token** - you'll need it for the next step

### 5. Add SONAR_TOKEN to GitHub Secrets

1. Go to your GitHub repository: https://github.com/SEO-Engine-Mk1/wobbl.ai
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Enter:
   - **Name**: `SONAR_TOKEN`
   - **Secret**: [Paste the token from SonarCloud]
5. Click **"Add secret"**

### 6. Verify SonarCloud Configuration

The project already includes a `sonar-project.properties` file with the correct configuration:

```properties
# Project information
sonar.projectKey=engine
sonar.organization=seo-engine-mk1

# Source code paths
sonar.sources=src,frontend/src,backend/src
sonar.tests=src,test,frontend/test,backend/test,frontend/src/**/*.test.*,frontend/src/**/*.spec.*,backend/src/**/*.test.*,backend/src/**/*.spec.*

# Exclusions
sonar.exclusions=node_modules/**,dist/**,build/**,.next/**,coverage/**,*.log,*.tmp,temp/**,docs/api/**

# Language settings
sonar.javascript.lcov.reportPaths=coverage/lcov.info,frontend/coverage/lcov.info,backend/coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info,frontend/coverage/lcov.info,backend/coverage/lcov.info

# Coverage settings
sonar.coverage.exclusions=**/*.test.*,**/*.spec.*,**/*.stories.*,**/*.config.*,**/node_modules/**,**/dist/**,**/build/**,**/.next/**

# Analysis settings
sonar.sourceEncoding=UTF-8
sonar.host.url=https://sonarcloud.io
```

### 7. Trigger First Analysis

The workflow will automatically run on:
- **Push** to `main` or `staging` branches
- **Pull Requests** targeting `main` or `staging`

To trigger the first analysis:

1. Make a small change to any file
2. Commit and push to the `main` branch
3. Check the **Actions** tab in GitHub for the workflow run
4. Visit your SonarCloud project to see the results

## 🎯 What Gets Analyzed?

### Code Quality Metrics
- **Bugs**: Potential errors in the code
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Technical Debt**: Time needed to fix issues
- **Coverage**: Test coverage percentage

### Supported Languages
- **TypeScript/JavaScript**: Frontend and backend code
- **Configuration Files**: JSON, YAML, etc.
- **Documentation**: Markdown files

### Project Structure Analysis
The configuration is optimized for the Engine repository structure:
- **Frontend**: `frontend/src/` directory
- **Backend**: `backend/src/` directory
- **Shared**: `src/` directory (if exists)
- **Tests**: All `**/*.test.*` and `**/*.spec.*` files

### Exclusions
- `node_modules/` - Dependencies
- `dist/`, `build/`, `.next/` - Build outputs
- `coverage/` - Coverage reports
- `**/*.test.*`, `**/*.spec.*` - Test files
- `**/*.stories.*` - Storybook stories
- `docs/api/` - Generated documentation

## 📊 Understanding the Results

### Quality Gate
SonarCloud provides a **Quality Gate** status:
- ✅ **PASSED**: Code meets quality standards
- ❌ **FAILED**: Quality issues need attention
- ⚠️ **WARNING**: Minor issues detected

### Key Metrics
- **Coverage**: Percentage of code covered by tests
- **Duplicated Lines**: Code duplication percentage
- **Maintainability Rating**: Code maintainability score (A-E)
- **Reliability Rating**: Bug-free probability (A-E)
- **Security Rating**: Security issue probability (A-E)

### Pull Request Decoration
When enabled, SonarCloud will comment on PRs with:
- 📊 **Coverage changes**
- 🐛 **New issues introduced**
- ✅ **Issues fixed**
- 📈 **Quality metrics**

## 🔧 Troubleshooting

### Common Issues

#### 1. "SONAR_TOKEN not found" Error
**Solution**: Ensure the token is correctly added to GitHub secrets as `SONAR_TOKEN`

#### 2. "Project not found" Error
**Solution**: Verify the `sonar.projectKey` and `sonar.organization` in `sonar-project.properties`

#### 3. "No coverage report found" Warning
**Solution**: Ensure tests generate coverage reports in `coverage/lcov.info`

#### 4. "Analysis failed" Error
**Solution**: Check the workflow logs for specific error messages

### Debug Steps

1. **Check Workflow Logs**: Go to Actions → Select workflow run → View logs
2. **Verify Token**: Ensure SONAR_TOKEN is correctly set in secrets
3. **Check Configuration**: Verify `sonar-project.properties` settings
4. **Review SonarCloud**: Check project settings in SonarCloud dashboard

## 🚀 Advanced Configuration

### Custom Quality Gates
1. Go to SonarCloud → **Quality Gates**
2. Create custom gate conditions
3. Assign to your project

### Branch Analysis
The workflow automatically analyzes:
- **Main branch**: Full analysis with coverage
- **Pull requests**: Incremental analysis
- **Feature branches**: On-demand analysis

### Integration with Other Tools
- **GitHub Issues**: Auto-create issues for critical problems
- **Slack Notifications**: Configure webhook notifications
- **Jira Integration**: Link analysis results to Jira tickets

## 📚 Additional Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Integration](https://docs.sonarcloud.io/getting-started/integrating-github-actions/)
- [Quality Gates Configuration](https://docs.sonarcloud.io/quality-gates/)
- [Coverage Configuration](https://docs.sonarcloud.io/coverage/)

## 🆘 Support

If you encounter issues:

1. **Check the logs** in GitHub Actions
2. **Review SonarCloud documentation**
3. **Visit SonarCloud community** for help
4. **Check GitHub repository issues** for similar problems

## 🎯 Engine Repository Specifics

### Multi-Project Structure
This repository contains both frontend and backend code:
- **Frontend**: Next.js application in `frontend/`
- **Backend**: Node.js services in `backend/`
- **Shared**: Common utilities in `src/` (if exists)

### Coverage Reports
The workflow looks for coverage reports in multiple locations:
- `coverage/lcov.info` - Root coverage
- `frontend/coverage/lcov.info` - Frontend coverage
- `backend/coverage/lcov.info` - Backend coverage

### Technology Stack
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Package Manager**: pnpm
- **Testing**: Jest, React Testing Library

---

**Ready to start improving your code quality?** Follow the steps above and your SonarCloud integration will be up and running in minutes! 🎉