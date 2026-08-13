# Post-live notes — www DNS / SSL incident (2026-08-13)

**Environment:** Production — Cloudflare Pages `wellness-needles`  
**Canonical URL:** `https://www.wellnessneedles.ie`  
**Related:** [GO_LIVE_ARCHITECTURE.md](./GO_LIVE_ARCHITECTURE.md), [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
**Ops workflow:** `.github/workflows/ops-fix-www-dns.yml` (`Ops — Fix www DNS`)

---

## Summary

After the first successful production releases (`v1.0.x`), many clients saw the **entire site** fail to load or show **“Your connection isn’t private”** (`NET::ERR_CERT_COMMON_NAME_INVALID`) on desktop and mobile.

**Root cause:** `www.wellnessneedles.ie` was still resolving (or intermittently resolving via cache) to a **legacy Azure Static Web Apps IP** (`13.70.37.114`). That host presents an **Azure** certificate (`*.azurewebsites.net` / ASE hostname), which does **not** match `www.wellnessneedles.ie`.

Apex (`wellnessneedles.ie`) and `wellness-needles.pages.dev` were already on Cloudflare and healthy. The break was **www DNS / stale Azure**, not the Next.js app build.

Performance tweaks (image compression, fonts, loaders) were investigated and **reverted** — they were not the production root cause.

---

## Symptoms

| What users saw | What was actually happening |
|----------------|------------------------------|
| Site “won’t load” / blank / Azure-style 404 | Client hit Azure `13.70.37.114` |
| `NET::ERR_CERT_COMMON_NAME_INVALID` | Browser got Azure TLS cert for `www` SNI |
| “Works on one network / device, not another” | Split DNS cache (Cloudflare vs stale Azure A) |
| `pages.dev` OK, `www` broken | Custom hostname DNS wrong / cached |

**Cert proof (same hostname, different IPs):**

| Destination IP | Certificate CN | Result |
|----------------|----------------|--------|
| Cloudflare `104.21.x` / `172.67.x` | `www.wellnessneedles.ie` | Valid HTTPS |
| Azure `13.70.37.114` | `*.msha-slice-…azurewebsites.net` | Browser blocks / mismatch |

---

## Timeline (local, 2026-08-13)

1. Production deploy via GitHub Release → Cloudflare Pages (`--branch=main`) brought the site live on Pages.
2. Reports of poor / failed loading on phone and desktop.
3. Investigation found `www` **A** still pointing at **Azure** while apex used Cloudflare.
4. Image/CSS “loading” fixes started, then **reverted** once DNS was confirmed as the whole-site failure.
5. Ops workflow `Ops — Fix www DNS` added; first run **failed** — deploy token lacked **Zone → DNS → Edit**.
6. Token updated with **DNS Edit**; workflow re-run **succeeded**.
7. Cloudflare zone left with: `www` **CNAME** → `wellness-needles.pages.dev` (**proxied**).
8. Some browsers still showed cert errors until **local DNS cache** was flushed (stale Azure A).

---

## Root cause (detail)

1. Domain historically pointed at **Azure / Hosting Ireland** hosting.
2. Nameservers moved to Cloudflare (`anderson` / `erin`), and Pages custom domains were attached.
3. A leftover **`www` → Azure** path remained in the wild (zone A record and/or long-lived resolver cache).
4. Clients that still resolved `www` to `13.70.37.114` received Azure’s certificate → `ERR_CERT_COMMON_NAME_INVALID`.
5. Clients that resolved to Cloudflare anycast received the correct Universal SSL cert for `www.wellnessneedles.ie`.

This is a classic **cutover leftover + TTL/cache** failure mode after moving off Azure.

---

## Fix applied

### Cloudflare DNS (authoritative)

Desired end state (confirmed by ops workflow):

```text
www.wellnessneedles.ie  CNAME  wellness-needles.pages.dev  (proxied: true)
```

- Delete any `www` **A/AAAA** (especially `13.70.37.114`).
- Delete wrong CNAMEs (Azure Static Apps / traffic manager targets).
- Keep Pages custom domain **`www.wellnessneedles.ie`** attached and Active.
- Apex remains on Pages; prefer **301 apex → www** (zone Redirect Rule + `public/_redirects`).

### Automation

Workflow: **Actions → Ops — Fix www DNS** (workflow_dispatch on `main`).

It:

1. Resolves zone `wellnessneedles.ie`
2. Lists / repairs `www` records
3. Scans the zone for Azure leftovers (`13.70.37.114`, `azurestaticapps`, `azurewebsites`, …)
4. Ensures Pages custom domain for `www`
5. Probes public DNS + HTTPS (expects cert `CN=www.wellnessneedles.ie`)

### Token permissions required

`CLOUDFLARE_API_TOKEN` (GitHub Environment **production** and/or repo secrets) must include at least:

| Scope | Permission | Why |
|-------|------------|-----|
| Account | Cloudflare Pages — Edit | Deploy + custom domains |
| Account | Account Settings — Read | Wrangler / account binding |
| User | Memberships — Read | Wrangler auth |
| **Zone** | **DNS — Edit** | **Repair www records** |
| Zone | Zone — Read (via zone resources) | Resolve zone id |

Optional (workflow may log auth errors without them): Cache Purge, SSL settings write.

Zone resources must include **`wellnessneedles.ie`**.

---

## Verification checklist

Run after any DNS change or cert complaint:

- [ ] `dig` / DoH: `www.wellnessneedles.ie` **A** → Cloudflare IPs only (not `13.70.37.114`)
- [ ] Cloudflare DNS UI: `www` is **CNAME** → `wellness-needles.pages.dev`, orange-cloud proxied
- [ ] No Azure A/CNAME leftovers for `www` in the zone
- [ ] `curl -4 -I https://www.wellnessneedles.ie/` → **200** (TLS verify **on**)
- [ ] Certificate subject / SAN includes `www.wellnessneedles.ie`
- [ ] Forced Azure IP still wrong (expected):  
      `curl --resolve www.wellnessneedles.ie:443:13.70.37.114 https://www.wellnessneedles.ie/` → cert mismatch / 404
- [ ] Client with old cache: `ipconfig /flushdns` (Windows) or reboot; retry in Incognito

**Healthy probe (from ops run):**

```text
www ipv4 200 172.67.179.190
subject=CN = www.wellnessneedles.ie
issuer=… Google Trust Services (Cloudflare Universal SSL)
```

---

## Client recovery (when cert warning persists)

If Cloudflare DNS is already correct but a device still shows `ERR_CERT_COMMON_NAME_INVALID`:

1. Close all tabs for the site  
2. Windows: `ipconfig /flushdns`  
3. Open **Incognito/Private** → `https://www.wellnessneedles.ie`  
4. If stuck: reboot, or set DNS to `1.1.1.1` / `8.8.8.8` temporarily  

Do **not** treat this as an app bug until the client resolves to Cloudflare IPs.

---

## Follow-ups (still recommended)

| Item | Owner | Notes |
|------|--------|------|
| Remove `www` / apex custom domains from **Azure Static Web Apps** | Owner | Stops Azure answering if someone still hits the old IP |
| Confirm apex → www **301** Redirect Rule | Owner / eng | Defense in depth with `public/_redirects` |
| Add **Cache Purge** to CF token (optional) | Owner | Ops workflow purge step currently may auth-fail |
| Document DNS Edit on token in go-live secrets list | Eng | Avoid repeat of first failed ops run |
| Performance pass (logo size, fonts, loader) | Eng | Deferred; not the cause of this outage |

---

## Lessons learned

1. **Cutover is not done until `www` and apex both resolve only to Cloudflare** — check A/AAAA/CNAME, not just “Pages domain Active”.
2. **`ERR_CERT_COMMON_NAME_INVALID` after a host move usually means wrong origin IP**, not a broken Pages deploy.
3. Deploy tokens with **Pages Edit only** cannot fix DNS — add **Zone DNS Edit** before relying on ops workflows.
4. **Stale resolver cache** will keep serving Azure for hours/days on some networks; flush instructions belong in the runbook.
5. Don’t chase frontend “loading” fixes for a DNS/TLS mismatch that breaks the **entire** site.

---

## Quick runbook

```text
Symptom: www cert error or Azure 404
  → Resolve www A/AAAA (must be Cloudflare, not 13.70.37.114)
  → If Azure IP: Cloudflare DNS → delete A; ensure CNAME www → wellness-needles.pages.dev (proxied)
  → Or: Actions → Ops — Fix www DNS
  → Flush client DNS / Incognito
  → Optional: remove custom domain in Azure portal
```

**Status as of ops success (2026-08-13):** Cloudflare DNS for `www` correct; HTTPS verifies with `CN=www.wellnessneedles.ie`. Remaining risk is **client/ISP cache** and **Azure still accepting the hostname** until removed in Azure.
