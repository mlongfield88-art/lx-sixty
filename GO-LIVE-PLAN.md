# LX Sixty Go-Live Plan

**Purpose:** Take `lxsixty.com` from unregistered to live website plus Google Workspace business email.
**Prepared:** 20 April 2026
**Domain confirmed:** `lxsixty.com` (Option A)
**Registrar target:** Cloudflare Registrar
**Mail platform target:** Google Workspace Business Starter

---

## Context

`lxsixty.com` is currently unregistered (confirmed via fresh WHOIS at 20 April 2026). The website `dist/` build is complete, the GitHub repo (`mlongfield88-art/lx-sixty`) is wired to a Cloudflare Pages project also called `lx-sixty`, and auto-deploy on push to main is configured via `.github/workflows/deploy.yml`. Site currently lives at `https://lx-sixty.pages.dev`.

What remains is entirely account-level work: register the domain, attach it to Pages, provision Workspace, add DNS records. There is no code work outstanding.

Unlike the ProLuxe Travel migration, this is a clean start. No existing registrar to move from, no live mail flow to preserve, no DNS records to carry over. Every record is added fresh.

---

## Phase A: Register lxsixty.com at Cloudflare Registrar

**Who:** Myles (account-creation action)
**Time:** 5 minutes
**Cost:** ~£8 per year (Cloudflare at-cost pricing, no markup)

### Steps

1. Log into Cloudflare dashboard at `dash.cloudflare.com`
2. Navigate to: **Domain Registration > Register Domains**
3. Search `lxsixty.com`, confirm available, add to cart
4. Checkout with payment method on file
5. Once registration completes, Cloudflare automatically creates the `lxsixty.com` zone in your account

### Verification

- Zone `lxsixty.com` appears in Cloudflare dashboard home screen with status "Active"
- `dash.cloudflare.com` > **Domain Registration** shows `lxsixty.com` with registrar "Cloudflare, Inc." and a renewal date one year from today
- `whois lxsixty.com` shows Cloudflare as registrar (propagates within 15 to 60 minutes)

---

## Phase B: Attach custom domain to Cloudflare Pages

**Who:** Myles (dashboard action, cannot be done via API without token)
**Time:** 5 minutes (plus SSL provisioning wait)

### Steps

1. Cloudflare dashboard > **Workers and Pages** > `lx-sixty`
2. Click **Custom Domains** tab > **Set up a custom domain**
3. Enter `lxsixty.com`, click **Continue**, then **Activate domain**
4. Repeat for `www.lxsixty.com`
5. Cloudflare automatically creates the required CNAME and apex records in the `lxsixty.com` zone (via apex CNAME flattening)

### Verification

- Custom Domains tab shows both entries with status "Active" and "Verified" (SSL certificate provisioned)
- `https://lxsixty.com` returns the landing page
- `https://www.lxsixty.com` returns the landing page

### Expected DNS records after Phase B (auto-created)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | lx-sixty.pages.dev | Proxied (orange) |
| CNAME | www | lx-sixty.pages.dev | Proxied (orange) |

Do not edit these manually. Cloudflare manages them.

---

## Phase C: Create Google Workspace tenant

**Who:** Myles (account-creation action)
**Time:** 15 minutes
**Cost:** £5.20 per user per month (Business Starter) or £10.40 (Business Standard)

### Recommendation

**Business Starter** is sufficient for a single founder inbox. You get 30GB Gmail storage, custom email, Meet (100 participants, no recording), shared drives not included. Upgrade later if needed. One licence for `myles@lxsixty.com`.

### Steps

1. Go to `workspace.google.com` > **Start Free Trial**
2. Select **Business Starter** plan
3. When asked "Does your business have a domain?", answer **Yes** and enter `lxsixty.com`
4. Create primary administrator account: `myles@lxsixty.com` (this becomes your admin login)
5. Google will provision the tenant and then require domain verification

### Domain verification

Google gives you a TXT record of the form `google-site-verification=<unique-token>` to add at the apex of `lxsixty.com`.

Add this in Cloudflare DNS (see Phase D records).

Return to Google Workspace signup, click **Verify**. Propagation is usually under 2 minutes inside Cloudflare.

---

## Phase D: DNS records for Google Workspace

**Who:** Myles pastes, I can pre-fill everything except the tenant-specific tokens.
**Time:** 10 minutes

All records go in the Cloudflare DNS dashboard for the `lxsixty.com` zone.

### Records to add

| Type | Name | Content | Proxy | TTL | Notes |
|------|------|---------|-------|-----|-------|
| TXT | @ | `google-site-verification=<token>` | n/a | Auto | Google supplies the token during Workspace signup. One-off verification, can be deleted once verified but safe to leave. |
| MX | @ | `smtp.google.com` | DNS only (grey) | Auto | Priority 1. Modern single-MX Google setup. MX records cannot be proxied. |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | n/a | Auto | SPF. Soft-fail `~all` is correct for new setups. |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:dmarc@lxsixty.com; ruf=mailto:dmarc@lxsixty.com; fo=1;` | n/a | Auto | DMARC in monitoring mode. Tighten to `p=quarantine` after 30 days of clean reports, then `p=reject` once confident. |
| TXT | google._domainkey | `v=DKIM1; k=rsa; p=<public-key>` | n/a | Auto | DKIM. Generated inside the Workspace Admin Console (see below). Add after step E2. |

### Cloudflare UI quirks

- Cloudflare accepts the full `v=DKIM1; ...` TXT value as a single string; it handles the 255-char splitting automatically.
- MX content field accepts just the hostname `smtp.google.com` and a separate priority field for `1`. Some Cloudflare interfaces show these as two columns.
- All TXT and MX records must be "DNS only" (grey cloud). Cloudflare's proxy does not pass SMTP or TXT lookups.

---

## Phase E: Activate mail and generate DKIM

**Who:** Myles inside Workspace Admin Console.

### Steps

1. After Phase D MX and SPF records are added, log into `admin.google.com` as `myles@lxsixty.com`
2. Navigate to **Apps > Google Workspace > Gmail > Authenticate email**
3. Click **Generate new record** (2048-bit RSA is the default and correct choice)
4. Copy the resulting TXT record value (the `v=DKIM1; k=rsa; p=<public-key>` string)
5. Add it to Cloudflare DNS as TXT on hostname `google._domainkey` (see Phase D table, last row)
6. Back in Workspace Admin Console, click **Start authentication** (button becomes active once DNS propagates, usually within a few minutes)
7. DKIM status changes to "Authenticating email"

### Verification sequence

Run these until all pass. Order matters: MX before SPF before DKIM before DMARC.

```bash
dig +short NS lxsixty.com
# Expected: two Cloudflare nameservers (x.ns.cloudflare.com)

dig +short MX lxsixty.com
# Expected: 1 smtp.google.com.

dig +short TXT lxsixty.com
# Expected: v=spf1 include:_spf.google.com ~all
# Plus the google-site-verification=... line (until you remove it)

dig +short TXT google._domainkey.lxsixty.com
# Expected: v=DKIM1; k=rsa; p=MIIBIjAN...

dig +short TXT _dmarc.lxsixty.com
# Expected: v=DMARC1; p=none; rua=mailto:dmarc@lxsixty.com; ...
```

### Send-test

Send a test email from `myles@lxsixty.com` to a personal account (e.g., a Gmail address).

Open the received message > More > Show original. Check:

- `SPF: PASS with IP <Google IP>`
- `DKIM: 'PASS' with domain lxsixty.com`
- `DMARC: 'PASS'`

All three must show PASS. If any fail, do not proceed to tightening DMARC.

---

## Phase F: Optional hardening (after 30 days of clean DMARC reports)

### DMARC tightening

Change `_dmarc` TXT from `p=none` to `p=quarantine` after 30 days of clean aggregate reports from `dmarc@lxsixty.com`. After another 30 days, `p=reject`.

### BIMI (brand indicator)

Once DMARC is at `p=quarantine` or stricter, you can add a BIMI record to show the LX Sixty logo next to emails in supporting mail clients (Gmail, Yahoo, Apple Mail). Requires a VMC (Verified Mark Certificate) which is ~$1,500/year. Not needed for MVP, flag as future.

### Aliases

Add in Admin Console (Directory > Users > myles@lxsixty.com > User information > Email aliases):
- `info@lxsixty.com` (picks up the public contact form hero CTA)
- `hello@lxsixty.com` (if preferred for introductions)

No DNS change needed for aliases.

---

## What I prepare in advance (no account access needed)

- This plan document
- DNS records pre-filled except for the two tenant-specific tokens (`google-site-verification` and the DKIM public key)

## What requires your action

- Phase A, Phase B: Cloudflare dashboard
- Phase C, Phase E steps 1-6: Google Workspace signup and Admin Console
- Phase D: Pasting records into Cloudflare DNS

## Blocked until Myles does account work

Everything. No code or automation can start a Workspace tenant or register a domain on your behalf.

---

## Interaction with ProLuxe domain transfer

Different domain (`lxsixty.com` vs `proluxetravels.com`), different zone, zero interference. You can run both tracks in parallel. The only shared resource is your Cloudflare account's billing method.

---

**End of plan.**
