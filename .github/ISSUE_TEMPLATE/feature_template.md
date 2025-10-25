name: Feature Branch Template
description: Template for creating new feature branches
title: "[FEATURE] "
labels: ["feature"]
body:
  - type: markdown
    attributes:
      value: |
        ## Feature Branch Description
        
        Please provide a clear description of the feature you're implementing.
        
  - type: textarea
    id: description
    attributes:
      label: Feature Description
      description: What does this feature do?
      placeholder: Describe the feature in detail...
    validations:
      required: true
      
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: What are the requirements for this feature to be considered complete?
      placeholder: |
        - [ ] Requirement 1
        - [ ] Requirement 2
        - [ ] Requirement 3
    validations:
      required: true
      
  - type: textarea
    id: technical-approach
    attributes:
      label: Technical Approach
      description: How do you plan to implement this feature?
      placeholder: Describe the technical implementation...
    validations:
      required: true
      
  - type: textarea
    id: testing
    attributes:
      label: Testing Strategy
      description: How will you test this feature?
      placeholder: Describe the testing approach...
    validations:
      required: true
      
  - type: dropdown
    id: modules
    attributes:
      label: Affected Modules
      description: Which modules are affected by this feature?
      multiple: true
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
    validations:
      required: true
      
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      description: What is the priority of this feature?
      options:
        - Critical
        - High
        - Medium
        - Low
    validations:
      required: true
      
  - type: textarea
    id: dependencies
    attributes:
      label: Dependencies
      description: Are there any dependencies or blockers?
      placeholder: List any dependencies or blockers...
      
  - type: textarea
    id: notes
    attributes:
      label: Additional Notes
      description: Any additional information or context.