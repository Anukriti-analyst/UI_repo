# Database Design (DB-first)

## 1) Core concepts
- **Master data**: Questions, SubQuestions, Sections, Categories
- **Form templates**: Forms + FormVersions + mappings
- **Runtime data**: Submissions + SubmissionAnswers (snapshot tied to version)
- **Reference data for validation**: CategoryGroups/Categories/CategoryValues (no JSON)
- **Audit**: AuditLogs

## 2) Key tables (logical)
- Users(UserId, Email, DisplayName, ...)
- Roles(RoleId, RoleName)
- UserRoles(UserId, RoleId)
- Territories(TerritoryId, Code, Name)
- Sections(SectionId, Name, DisplayOrder)
- Questions(QuestionId, Text, Type, ...)
- SubQuestions(SubQuestionId, QuestionId, TriggerValue, Text)
- Forms(FormId, TerritoryId, Name, ...)
- FormVersions(FormVersionId, FormId, VersionNumber, IsActive)
- FormSections(FormSectionId, FormVersionId, SectionId, DisplayOrder)
- FormQuestions(FormQuestionId, FormSectionId, QuestionId, DisplayOrder, IsRequired)
- CategoryGroups(CategoryGroupId, FormVersionId, GroupType, Source, ...)
- Categories(CategoryId, CategoryGroupId, CategoryKey, DataType, ...)
- CategoryValues(CategoryValueId, CategoryId, TerritoryId, NumericValue, Currency, Unit, Qualifier, TextValue, EffectiveFrom, EffectiveTo)
- Submissions(SubmissionId, FormVersionId, SubmittedBy, Status, ...)
- SubmissionSections(SubmissionSectionId, SubmissionId, SectionName, DisplayOrder)
- SubmissionAnswers(SubmissionAnswerId, SubmissionSectionId, QuestionText, AnswerValue)
- AuditLogs(AuditId, EntityName, EntityId, Action, PerformedBy, ...)

## 3) Constraints / invariants
- Only one active FormVersion per Form.
- CategoryValues: only one active (EffectiveTo NULL) per (CategoryId, TerritoryId).
- Submissions always reference the FormVersion used.

## 4) Indexing (recommended)
- Submissions(SubmittedBy, SubmittedAt)
- FormSections(FormVersionId, DisplayOrder)
- FormQuestions(FormSectionId, DisplayOrder)
- CategoryValues(CategoryId, TerritoryId, EffectiveTo)
