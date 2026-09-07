# API Design

## Standards
- Base path: /api/v1
- DTOs only (no EF entities)
- Consistent error response:
  - traceId
  - errorCode
  - message
  - details[]

## Suggested endpoint groups
### Public/General
- GET /api/v1/territories
- GET /api/v1/forms?territoryCode=AU
- GET /api/v1/forms/{formId}/active-version
- GET /api/v1/form-versions/{formVersionId}/definition (sections + questions + rules)
- GET /api/v1/submissions
- GET /api/v1/submissions/{submissionId}
- POST /api/v1/submissions (create draft)
- PUT /api/v1/submissions/{submissionId}/answers
- POST /api/v1/submissions/{submissionId}/submit
- GET /api/v1/submissions/{submissionId}/pdf
- POST /api/v1/submissions/{submissionId}/email

### Admin
- POST/PUT /api/v1/admin/questions
- POST/PUT /api/v1/admin/subquestions
- POST/PUT /api/v1/admin/sections
- POST/PUT /api/v1/admin/forms
- POST /api/v1/admin/forms/{formId}/versions
- POST /api/v1/admin/forms/{formId}/versions/{version}/activate
- POST/PUT /api/v1/admin/categories (groups/categories/values)

## AuthZ rules
- Admin endpoints require Admin role
- General endpoints require authenticated user
