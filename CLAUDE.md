# LX Sixty: Corporate Website

Group corporate website for LX Sixty Group. Lists portfolio companies and positions the group as a whole.

## Stack
- Static HTML/CSS/JS
- Deploys from dist/ directory
- Cloudflare Pages (GitHub push, mlongfield88-art)

## Key files
- `dist/index.html`, the deployed site

## Portfolio framing (authoritative)

The group's flagship venture is **Capsian** (venture inside LX Sixty Group; share issuer of record is LX Sixty Holdings Ltd), a multi-tenant commercial decision engine for hotel group sales. It evaluates each hotel's commercial policy (pricing thresholds, approval hierarchies, response time targets, escalation triggers) and resolves conflicts when a single RFP touches multiple independent properties. Sits above existing systems (Opera, Mews, Apaleo, Cloudbeds, Salesforce, Delphi). Core IP is the Capsian Guardrails conflict resolution algorithm.

Authoritative product definitions: `/Projects/Capsian/CLAUDE.md` and `/Projects/Capsian/Strategy/Capsian Project Handoff.md`.

The other portfolio entries are ProLuxe Travel (luxury travel management, with IBA 2026 as flagship) and Future Ventures (pipeline).

## Status as of 20 April 2026

Site is live at `https://lxsixty.com` and `https://www.lxsixty.com`. Fully compliant with Companies Act 2006 s.1202 and UK GDPR Art 13 (see footer and privacy policy Section 1). Mail stack authenticated end to end (SPF, DKIM, DMARC all PASS). `myles@lxsixty.com` and `info@lxsixty.com` active on Google Workspace Business Starter.

## Outstanding work

- **ICO Data Protection Fee registration.** Myles self-registering end of week (target: by 25 April 2026). Process at `ico.org.uk/for-organisations/data-protection-fee/`. Once registered, no site change needed; ICO number can be added to privacy policy as a future refinement but is not required.
- **DMARC tightening.** Currently `p=none` (monitoring). After 30 days of clean aggregate reports landing in `myles@lxsixty.com` (so from ~20 May 2026), tighten to `p=quarantine`. Another 30 days later, `p=reject`. Single API call each time when ready.
- **Site content is minimal by design.** After commit 47772a4 (11 Apr 2026), the landing page is a single-panel wordmark plus tagline plus contact. No portfolio companies section. This is intentional and supersedes the earlier "Capsian section needs rewriting" flag. If group positioning needs richer content later, treat it as a new design cycle.

## Historical setup reference

`GO-LIVE-PLAN.md` at the root of this directory documents the 20 April 2026 setup from unregistered domain to live compliant site plus Google Workspace. Keep for reference in case the same sequence is used for another group domain later.

## Model routing

Inherits from `../CLAUDE.md` (Web Design parent). Default **Sonnet** for build, code, animation, and deploy work. Use **Opus** for group-level brand voice (LX Sixty corporate, ProLuxe agency, Sangnoir corporate, Capsian Invest investor copy) and any client-facing proposal narrative. Use **Haiku** for asset rename, sitemap regeneration, deploy status checks, and simple find-replace.

## Connected Projects
- **Part of**: Web Design (LX Sixty Group in-house capability)
- **Root brain**: `../../CLAUDE.md` (full group structure and cross-connections)
- **Capsian**: `../../Capsian/CLAUDE.md` (Capsian venture, commercial decision engine SaaS, under LX Sixty Group)
- **ProLuxe Travel site**: `../proluxe-travel/CLAUDE.md`
- **Sangnoir site**: `../sangnoir/CLAUDE.md`
