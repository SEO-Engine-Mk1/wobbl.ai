name: Bug Report Template
description: Template for reporting bugs
title: "[BUG] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        ## Bug Report
        
        Please provide as much detail as possible to help us reproduce and fix the issue.
        
  - type: textarea
    id: bug-description
    attributes:
      label: Bug Description
      description: What is the bug?
      placeholder: Describe the bug in detail...
    validations:
      required: true
      
  - type: textarea
    id: reproduction-steps
    attributes:
      label: Reproduction Steps
      description: How can we reproduce this bug?
      placeholder: |
        1. Go to...
        2. Click on...
        3. See error...
    validations:
      required: true
      
  - type: textarea
    id: expected-behavior
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
      placeholder: Describe the expected behavior...
    validations:
      required: true
      
  - type: textarea
    id: actual-behavior
    attributes:
      label: Actual Behavior
      description: What actually happened?
      placeholder: Describe the actual behavior...
    validations:
      required: true
      
  - type: textarea
    id: error-messages
    attributes:
      label: Error Messages
      description: Are there any error messages?
      placeholder: Copy and paste any error messages...
      
  - type: dropdown
    id: module
    attributes:
      label: Affected Module
      description: Which module is affected?
      options:
        - SERP Research
        - Article Generation
        - Originality Check
        - Claim Registry
        - WordPress Publishing
        - Social Syndication
        - Email Engine
        - GSC Integration
        - Frontend UI
        - Backend API
        - Database
        - Infrastructure
        - Unknown
    validations:
      required: true
      
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      description: How severe is this bug?
      options:
        - Critical (blocks functionality)
        - High (major impact)
        - Medium (minor impact)
        - Low (cosmetic issue)
    validations:
      required: true
      
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: What environment are you using?
      placeholder: |
        - OS: [e.g., macOS, Windows, Linux]
        - Browser: [e.g., Chrome, Firefox, Safari]
        - Version: [e.g., v1.0.0]
        - Node.js: [e.g., v18.17.0]
        - Database: [e.g., PostgreSQL 14]
    validations:
      required: true
      
  - type: textarea
    id: additional-context
    attributes:
      label: Additional Context
      description: Any additional information or context.
      placeholder: Add any other context about the problem here...