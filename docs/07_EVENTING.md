# Eventing (Event Grid)

## Goals
- Inbound: keep category limits/values in sync with upstream systems (GBS/GPM)
- Outbound: publish submission lifecycle events for subscribers

## Inbound events (pattern)
- Event type examples:
  - CategoryValueUpdated
  - CategoryGroupUpdated
- Handler responsibilities:
  - validate schema
  - map to CategoryGroups/Categories/CategoryValues
  - upsert with EffectiveFrom/EffectiveTo
  - idempotency key = (eventId or upstream version)

## Outbound events (topics)
- Topic: fmessentials.submissions
- Events:
  - SubmissionCreated
  - SubmissionUpdated
  - SubmissionSubmitted

## Reliability requirements (recommended)
- Idempotent processing
- Dead-letter / poison handling strategy
- Observability: correlationId/traceId propagation
