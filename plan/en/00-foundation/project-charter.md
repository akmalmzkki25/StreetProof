# StreetProof project charter

Document ID: FND-01  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/00-foundation/project-charter.md)

## Mandate

StreetProof helps facility operators turn damage reports into assigned work with completion evidence and supervisor-controlled closure. AI prepares drafts and identifies missing context. Operators, technicians and supervisors retain operational decisions.

This package plans an Indonesian B2B product for a 2-4-person team: a hackathon demonstration, a controlled pilot and a 12-month commercial development horizon. Product choices are testable proposals. No customers, contracts, interviews or pilot outcomes are claimed to exist.

## Users and buying unit

The initial recommendation is a commercial building operator with 1-5 sites, starting with one building and 2-4 non-emergency repair categories. These site counts define a proposed ICP boundary, not observed customer size. A campus becomes the alternative when sponsorship, data permission and user access are more credible. The facility manager is the champion, operational leadership is the prospective buyer, and IT/legal/procurement approve according to the organization.

An organization is the tenant boundary. A site is the operational boundary and candidate pricing unit. Reporters are not billed. Technicians and vendors see only authorized work.

## Outcomes to prove

| Outcome | Evidence to collect | Owner |
|---|---|---|
| Operators spend less time structuring reports | Active handling time per case, corrections and clarification against matched baseline | P + A |
| Technicians receive usable context | Location/evidence completeness and repeated information requests | E + Q |
| Supervisors can reject inadequate proof | Submission, rejection, evidence revision and verification history | E + Q |
| Buyers obtain value worth paying for | Actual costs, measured benefits and pilot offer decisions | P |

The gates in [pilot-and-roi-validation](../05-delivery/pilot-and-roi-validation.md) are proposed targets to agree before observation. Synthetic demonstration numbers do not establish business results.

## Work boundaries

Documentation includes research, business model, product requirements, proposed API contracts, data design, AI evaluation, security, delivery and marketing. Building the application, registering for the event, purchasing services, sending messages and deployment are subsequent work. This package does not certify compliance or constitute legal contracts.

The initial release excludes ERP, certified structural inspection, automatic procurement/payments, emergency dispatch, public complaint maps and predictive maintenance. Government production integration waits for authorization and demonstrated need.

## Stages and continuation decisions

| Stage | Output | Exit gate |
|---|---|---|
| Discovery | Sponsor, permissioned reports, baseline and buying problem | Pilot access and sufficiently recurring pain exist |
| Hackathon | One report-to-verified_closed flow using synthetic/permissioned data | Acceptance scenarios are repeatable |
| 8-week pilot | Baseline, shadow mode, limited live use, evaluation | Benefits, risks, technician burden and commercial commitment reviewed together |
| Productization | Customer operations, data isolation, support and portability | Ability to support real customers rather than feature count |
| 12-month expansion | Additional sites/organizations justified by results | Support costs, retention and margin support growth |

## Governance

P owns scope and commercial changes; E owns application integrity; A owns model evaluation; Q owns UX research and acceptance quality. One person can hold multiple roles. Responsibilities and decisions remain visible in a two-person team.

Record material changes in the [decision register](decision-register.md), including rationale, costs, dependencies and review triggers. Real-data decisions precede the pilot rather than follow a running application.
