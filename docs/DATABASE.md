# Database Notes

DB-first. Key points:
- Form updates create new FormVersions (no in-place mutation).
- Categories are normalized (no JSON).
- SubmissionAnswers are snapshots (open old submissions exactly as saved).

Add:
- full ER diagram (text)
- indexing strategy
- migration approach
