# Integrations and migration

TECH-06 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/04-technical/integrations-and-migration.md)

Contents: [Recommendation](#recommendation) · [Data contract and ownership](#data-contract-and-ownership) · [Migration procedure](#migration-procedure) · [Failure behavior](#failure-behavior) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation

Offer standalone operation for teams without a CMMS and controlled export for teams with one. Begin with CSV and a documented identifier map. A custom bidirectional CMMS, WhatsApp Business, maps and MCP are deferred until a sponsor proves a workflow need and the core acceptance gate passes. No vendor partnership or API entitlement is assumed.

| Interface | Pilot scope | Gate before expansion |
| --- | --- | --- |
| Meta adapter | Server-only draft from minimized evidence | Account probe, Standard terms, evaluation, bounded retries |
| Supabase Auth/Storage | Member identity and private evidence | Tenant denials, credential boundaries, restore/deletion rehearsal |
| Notifications | In-app task/status notification, optional email adapter | Recipient permission, delivery record and support ownership |
| CSV export/import | Reviewed mapping and dry-run | Data-owner permission, reconciliation, rollback |
| Existing CMMS | One-way companion export initially | System of record and conflict owner agreed |
| WhatsApp/maps/MCP | Outside core | Separate access, pricing, privacy and usability case |

## Data contract and ownership

CSV v1 fields: `external_id, site_code, location_text, category_code, priority, description, reported_at, assigned_external_user_id, legacy_status, source_system`. Keep UTF-8, ISO timestamps with offset, a versioned category/status mapping, and a stable `source_system + external_id` uniqueness key per tenant. Export contains work status, timestamps, evidence references and verification metadata; raw reporter tokens and permanent media URLs are prohibited. Media export requires a separate authorized manifest and short access window.

Agree whether StreetProof or the CMMS owns assignment and close-out. If the CMMS is authoritative, imported closure alone cannot become supervisor verification without a documented evidence/approval mapping. Preserve external status verbatim alongside normalized status. Unsupported values enter a review queue rather than being guessed. Reopening and cancellation must round-trip explicitly before bidirectional sync is considered.

## Migration procedure

1. P and the customer inventory sources, personal data, volume and permissions. Import only needed open work and agreed history.
2. E validates a sample and produces row-level errors, duplicate candidates and missing-location counts. No import mutates live work during dry-run.
3. Q and the site owner sign off category, location, user and status mappings. Legacy closed records remain `legacy_closed` metadata, not silently verified_closed.
4. Run an idempotent batch with a migration ID, content digest and reconciliation counts. Separate imported observation time from import time.
5. Compare source rows, accepted/rejected rows, canonical tickets, evidence counts and totals by status/site. Document exceptions.
6. Hold a short agreed cutover window and retain a permitted source snapshot. Roll back only unmodified imported records; preserve subsequent human work and resolve conflicts manually.

## Failure behavior

Outbox consumers deduplicate event IDs and record attempts, provider message ID and final disposition. A timeout after sending may mean delivery happened; reconcile before retrying where the provider permits it. Customer work stays committed during notification failure. Late updates cannot overwrite a newer revision; concurrent external edits enter conflict review. Never claim exactly-once delivery across an external API without verified provider semantics.

The [Supabase Queues documentation](https://supabase.com/docs/guides/queues) (T-05) supports durable job evaluation, while [Meta pricing/limits](https://dev.meta.ai/docs/pricing-rate-limits) (T-11) requires team-level throttling and Retry-After handling. Provider documentation is not an account test.

## Dependencies and next action

P obtains a sample export and names the system-of-record owner. E writes a mapping specification and reversible dry-run; Q verifies five representative rows including a reopen and missing evidence. Reject custom integration scope until volume and ownership are clear. Link contract changes to [architecture decisions](architecture-decisions.md) and price integration work separately from the site subscription.
