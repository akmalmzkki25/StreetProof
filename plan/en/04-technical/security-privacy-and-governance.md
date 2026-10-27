# Security, privacy and governance

TECH-07 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/04-technical/security-privacy-and-governance.md)

Contents: [Recommendation and responsibility](#recommendation-and-responsibility) · [Threats and controls](#threats-and-controls) · [Reporter and media access](#reporter-and-media-access) · [Retention and deletion schedule](#retention-and-deletion-schedule) · [Indonesian legal and procurement review](#indonesian-legal-and-procurement-review) · [AI and incident governance](#ai-and-incident-governance) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and responsibility

Use synthetic or permissioned demo content. Real pilot data requires a named customer data owner, an agreed purpose/notice, role/site permissions, private media, deletion procedure and restore rehearsal. These controls are proposed requirements, not a compliance certification or legal conclusion. Customer counsel/data owner must determine applicable Indonesian obligations, transfer basis, contracts and incident deadlines before launch. Vendor certifications do not certify StreetProof.

## Threats and controls

| Threat | Proposed control | Evidence required before pilot |
| --- | --- | --- |
| Cross-tenant object access | Server authorization + RLS + composite foreign keys + tenant object path | Two-tenant allow/deny tests across APIs, SQL, exports, media |
| Leaked reporter receipt | Random 32-byte token, hashed at rest, scoped/revocable | Guessing, expiry, rotation, log-redaction checks |
| SSR session/cache leak | Verified claims/current membership, no shared caching | Direct API/Action call and two-user cache scenario |
| Malicious upload | Allowlist, byte/decoded-dimension limits, quarantine, malware/decoder checks | Oversize, renamed executable, malformed image, unavailable scanner |
| Prompt injection | Treat text/photo as data, strict schema, no model mutations | Adversarial evaluation and manual fallback |
| Excess privileged access | Separate server secrets, least privilege, audited break-glass | Secret scan, access review, emergency revocation rehearsal |
| Spam/denial of budget | Site/session/IP quotas, bounded uploads/jobs, circuit breaker | NAT-friendly abuse scenarios and per-tenant usage visibility |

[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) (T-03) and [Storage access controls](https://supabase.com/docs/guides/storage/security/access-control) (T-06) describe mechanisms, including privileged bypass. Never put secret/service credentials in the browser. Restrict exposed schemas, table grants and views, not just UI buttons. For SSR follow [Supabase's verified-identity/cache guidance](https://supabase.com/docs/guides/auth/server-side/nextjs) (T-02); a client session object alone is insufficient authorization.

## Reporter and media access

Generate at least 128 bits of cryptographic entropy; propose 256 bits. Store only a token hash, report scope, expiry and revocation metadata. The receipt link places the raw token in a fragment, which the client exchanges via POST then removes with browser history replacement. Use no third-party analytics on that page, a restrictive referrer policy, and redact request bodies/authorization. Exchange yields a restricted Secure HttpOnly SameSite cookie. Default scope is status; clarify scope is explicit. It never exposes other reports, staff contacts or internal notes.

Propose token expiry at operational retention or 90 days, whichever is earlier; data owner can shorten it. Revocation and rotation invalidate old reporter sessions through server credential checks. A lost token cannot be recovered by sequential report ID; an authorized operator follows a documented identity/channel recovery process or supplies no private data.

Store media privately with immutable paths. Issue signed downloads for a proposed five minutes after authorization. Already issued URLs can remain usable until TTL, so stop issuing new links on revocation and document that residual window. Strip EXIF/geolocation, create sanitized derivatives, minimize faces/plates where feasible, and prompt reporters to avoid unnecessary people/documents. Original quarantine objects have short agreed lifetimes. A scanner outage keeps files quarantined, with manual text handling rather than unsafe release.

## Retention and deletion schedule

| Class | Proposed pilot schedule | Owner and deletion behavior |
| --- | --- | --- |
| Operational media and reporter contact | 90 days after agreed case/collection anchor | Data owner chooses anchor; delete originals, derivatives and contact |
| Work/audit record | 365 days | Minimize/redact personal payload; retain justified non-identifying events |
| Aborted/expired upload orphans | Cleanup within 24 hours after lease expiry | E monitors failed cleanup and provider residual objects |
| Export file | 24 hours | Remove object; signed link expires earlier |
| Application logs | 30 days | No raw tokens, contact or images; investigate explicit exceptions |
| Backups | Inventory actual provider and offsite retention | Expire on documented cycle; controlled restore reapplies deletion ledger |

These are configurable assumptions, not statutory periods. Legal holds require a recorded authority, scope and review date. Deletion request flow: verify authority, inventory references, revoke credentials, delete active objects/derivatives/exports and personal fields, record class-count tombstone, mark backup expiry date, then verify completion. Never promise immediate physical erasure from all backups. Reapply the deletion ledger before any restored system reconnects to users or providers. See [backup documentation](https://supabase.com/docs/guides/platform/backups) (T-08) and verify object coverage separately from database recovery.

## Indonesian legal and procurement review

The official [UU 27/2022 text](https://peraturan.go.id/files/Salinan+UU+Nomor+27+Tahun+2022.pdf) (T-14, read via Jina) defines controller/processor roles and addresses processing basis in Article 20, processor arrangements in Article 51 and overseas transfer in Article 56. Use these as review inputs, not a claim that this design satisfies the Act. Customer counsel must determine the actual roles, basis, notices/rights, incident procedure including Article 46, retention and transfer safeguards for the pilot.

| Open issue | Required decision/evidence before real data |
| --- | --- |
| Hosting and PSE applicability | Identify private/public system classification, applicable registration/hosting rules and current implementing measures; no hosting conclusion is inferred from the original report |
| Vendor/subprocessor chain | Inventory Supabase DB/Auth/Storage, Render app/worker, Meta inference and any email/monitoring provider; actual countries, contracts, subprocessors, access, retention and deletion remain to be verified |
| Cross-border processing | Map every data flow including inference, logs and backup; document the Article 56 assessment and customer authorization before Singapore/provider selection |
| Processor instructions | Agree permitted purposes, access limits, onward processors and written approvals where applicable; avoid unrelated training/marketing uses |
| Government/public-campus purchase | Customer procurement owner identifies entity/funding, method, vendor qualification, contract and data-hosting requirements before promising a pilot or purchase timeline |

The [LKPP official register for Perpres 46/2025](https://jdih.lkpp.go.id/regulation/peraturan-presiden/peraturan-presiden-nomor-46-tahun-2025) (T-15, actual page read) identifies it as a second amendment to Perpres 16/2018 on government procurement and lists it as in force. This is a reason to check the applicable current procurement framework with the buyer, not evidence that every campus follows one route. Detailed applicability, implementing rules and customer-specific obligations are unresolved. A direct PP 71/2019 page retrieval timed out (T-17); no legal hosting assertion is based on it. Keep the pilot synthetic if these matters remain open.

## AI and incident governance

Use Meta Standard mode for real data by default. [Meta terms on the pricing page](https://dev.meta.ai/docs/pricing-rate-limits) (T-11) say Standard content is not used to train models; Contributor grants training permission for discounts. This does not settle processing location, retention, subprocessors or every contract obligation. Obtain those answers before sending pilot data. No default Contributor opt-in.

P is accountable for customer communication; E contains access leaks, rotates secrets and preserves minimized evidence; Q records affected workflow; A disables AI if implicated. Follow applicable agreed/legal notification obligations after counsel review, without inventing deadlines. No external message is authorized by this plan alone. See [support](../05-delivery/operations-and-support.md).

## Dependencies and next action

P obtains the data-owner signoff and transfer/processor answers. E produces a data-flow inventory, access-denial evidence, deletion ledger and restore record. Q validates notice and redaction UX. Block real-data pilot until critical gaps are resolved; the synthetic demo can continue independently.
