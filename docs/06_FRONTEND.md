# Frontend Design (React)

## UX goals
- Responsive UI across mobile/tablet/laptop
- Wizard flow for form completion
- Admin configuration screens
- Dashboard for General users with hyperlinks to submissions

## Page structure
### General
- /dashboard
- /submissions/:id
- /new (wizard)
  - step: select form
  - step: section-by-section form
  - save draft / submit

### Admin
- /admin/questions
- /admin/sections
- /admin/forms
- /admin/forms/:formId/versions
- /admin/categories

## State management (recommended)
- React Query (server cache) + local state for wizard
- Form library: React Hook Form + schema validation
