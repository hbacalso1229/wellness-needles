# Post-live notes — www DNS / SSL / Azure 404 (2026-08-13)

**Environment:** Production — Cloudflare Pages `wellness-needles`  
**Canonical URL:** `https://www.wellnessneedles.ie`  
**Related:** [GO_LIVE_ARCHITECTURE.md](./GO_LIVE_ARCHITECTURE.md), [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
**Ops workflow:** `.github/workflows/ops-fix-www-dns.yml` (`Ops — Fix www DNS`)

---

## Summary

After the first successful production releases (`v1.0.x`), clients (especially **phones**) saw:

- Site “won’t load” / Microsoft Azure blue **404 Web Site not found**
- Or **“Your connection isn’t private”** (`NET::ERR_CERT_COMMON_NAME_INVALID`)

even when typing **`https://www.wellnessneedles.ie`**.

**Root cause:** `www` (and sometimes apex) still resolved via **stale DNS** to a **legacy Azure** IP (`13.70.37.114`). That host serves Azure’s default page / Azure TLS cert — not Cloudflare Pages.

Authoritative DNS is **Cloudflare** (`anderson` / `erin`). Hosting Ireland is **registrar only**. Editing Hosting Ireland website DNS does nothing while NS point at Cloudflare.

Performance tweaks (images/fonts/loaders) were investigated and **reverted** — not the root cause.

---

## Permanent fix (do all three)

### 1. Cloudflare (source of truth) — engineering / ops

Desired DNS:

```text
www.wellnessneedles.ie     CNAME  wellness-needles.pages.dev   (proxied)
wellnessneedles.ie         Pages custom domain (proxied A/AAAA via CF)
```

- **No** records whose content is Azure (`13.70.37.114`, `azurestaticapps`, `azurewebsites`, …)
- Pages custom domains: **`www`** + **apex** Active
- **Redirect Rule** (zone, Free): apex → www 301  
  Match `https://wellnessneedles.ie/*` → `https://www.wellnessneedles.ie/${1}`  
  Also shipped in deploy via [`public/_redirects`](../public/_redirects)

**Run:** GitHub → Actions → **Ops — Fix www DNS** → Run workflow (`main`).

Token needs **Zone → DNS → Edit** on `wellnessneedles.ie`. Redirect Rule creation may also need Zone Rulesets / Redirect permission; if API warns, add the rule once in Cloudflare UI.

### 2. Azure (kill old host) — owner (required for permanent phone fix)

While Azure still answers on the old IP, any phone with **stale DNS** keeps seeing the blue Azure 404 (Azure’s own page says this: “Client cache is still pointing the domain to old IP”).

**Owner steps (Azure Portal):**

1. Open the old **Static Web App** or **App Service** that used to host this site  
2. **Custom domains** → remove `www.wellnessneedles.ie` and `wellnessneedles.ie`  
3. If unused: **delete** or stop the app entirely  
4. Do **not** re-add these hostnames to Azure

### 3. Hosting Ireland — owner (nameservers only)

1. Domain control panel for `wellnessneedles.ie` → **Nameservers** (not “Manage DNS” records)  
2. Confirm only:
   - `anderson.ns.cloudflare.com`
   - `erin.ns.cloudflare.com`
3. Do **not** recreate website A/CNAME records at Hosting Ireland  
4. Keep mail at Cloudflare (Zoho MX/SPF/DKIM) — never move mail DNS back to Hosting Ireland casually

**External check:** `dig NS wellnessneedles.ie` must return Cloudflare NS only.

---

## Why the phone still shows Azure after Cloudflare is fixed

1. User types **`https://www.wellnessneedles.ie`**
2. Mobile carrier / phone OS still has cached **A → 13.70.37.114**
3. Browser hits Azure → blue 404 or bad cert  
4. Address bar may **hide `www.`** — looks like apex, but the lookup was still for `www`

PC `ipconfig /flushdns` does **not** clear the phone.

**Phone recovery:**

1. Incognito / Private tab  
2. Clear site data for wellnessneedles.ie  
3. Airplane mode 10s, or switch Wi‑Fi ↔ mobile data  
4. Wait for TTL if still stuck  

---

## Symptoms → cause

| What users saw | What was happening |
|----------------|--------------------|
| Azure blue 404 on phone (typed www) | Stale `www` → Azure IP |
| `NET::ERR_CERT_COMMON_NAME_INVALID` | Azure TLS cert for `www` SNI |
| Works on PC / one network, not phone | Split DNS cache |
| `pages.dev` OK, custom domain broken | Custom hostname path wrong / cached |

| Destination IP | Certificate / page | Result |
|----------------|-------------------|--------|
| Cloudflare `104.21.x` / `172.67.x` | `CN=www.wellnessneedles.ie` | Live site |
| Azure `13.70.37.114` | Azure default / `*.azurewebsites.net` | 404 or cert error |

---

## Automation (`Ops — Fix www DNS`)

1. Zone lookup `wellnessneedles.ie`  
2. Repair **www** + scan **apex** for Azure leftovers  
3. Zone-wide delete of Azure-pointing records  
4. Ensure www CNAME → `wellness-needles.pages.dev` (proxied)  
5. Ensure Pages domains www + apex  
6. Ensure apex → www **301** Redirect Rule (API; warn if token lacks Rulesets)  
7. Public dig + HTTPS checks; **fail** if A records still include `13.70.37.114`

### Token permissions

| Scope | Permission | Why |
|-------|------------|-----|
| Account | Cloudflare Pages — Edit | Deploy + custom domains |
| Account | Account Settings — Read | Wrangler |
| User | Memberships — Read | Wrangler |
| **Zone** | **DNS — Edit** | Repair records |
| Zone | Rulesets / Redirect (recommended) | Apex → www rule via API |

Zone resource: **`wellnessneedles.ie`**.

---

## Verification checklist

- [ ] `dig NS wellnessneedles.ie` → Cloudflare only (`anderson` / `erin`)
- [ ] `dig A www.wellnessneedles.ie` → Cloudflare IPs only (not `13.70.37.114`)
- [ ] `dig A wellnessneedles.ie` → Cloudflare IPs only
- [ ] Cloudflare DNS UI: www CNAME → `wellness-needles.pages.dev` proxied; no Azure leftovers
- [ ] Redirect Rule or `_redirects`: apex → www **301**
- [ ] `curl -4 -I https://www.wellnessneedles.ie/` → **200**, cert for www
- [ ] Azure Portal: custom domains for this hostname **removed**
- [ ] Hosting Ireland: NS still Cloudflare; no website A records there
- [ ] Phone: Incognito / airplane toggle after cutover

---

## Lessons learned

1. Cutover is not done until **www and apex** resolve only to Cloudflare **and** Azure no longer hosts the hostname.  
2. Phone Azure 404 after typing **www** is almost always **stale mobile DNS**, not a Next.js bug.  
3. Hosting Ireland DNS zone is inactive once NS → Cloudflare — fix records in **Cloudflare**.  
4. Deploy tokens need **Zone DNS Edit** for ops repair workflows.  
5. Don’t chase frontend “loading” fixes for DNS/TLS cutover failures.

---

## Quick runbook

```text
Phone: typed www → Azure 404 / bad cert
  → dig www (must NOT be 13.70.37.114)
  → Actions → Ops — Fix www DNS
  → Owner: remove custom domains in Azure (permanent)
  → Owner: confirm HI nameservers = Cloudflare only
  → Phone: Incognito / Airplane / clear site data
```

**Engineering status:** Cloudflare DNS + ops workflow lock www/apex off Azure; `_redirects` ships apex→www.  
**Owner remaining for true permanence:** decommission Azure hostnames; confirm Hosting Ireland NS only.
