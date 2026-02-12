# RMG Ecosystem Architecture Audit Report
**Date:** February 12, 2026  
**Scope:** RMG, SCRP, WSPR, LDGR, OMNI  

---

## Executive Summary

The RMG ecosystem has grown organically across multiple repositories and deployment targets. While core functionality works, there are **critical security vulnerabilities**, **architectural debt**, and **significant redundancy** that should be addressed before further feature development. This report identifies 7 critical, 8 high, and 12 medium-priority findings.

---

## 🔴 CRITICAL — Fix Immediately

### C1. `.env` file is NOT gitignored and is committed to GitHub
**Location:** `RMG/.gitignore` — missing `.env`  
**Impact:** Your Supabase URL and anon key are in the git history. While the anon key is designed to be public (it's a publishable key), the `.env` file pattern means if you ever add a service role key or other secrets here, they'll be committed too.  
**Fix:** Add `.env` to `.gitignore` immediately. Rotate any keys that were ever in this file.

### C2. SCRP backend has ZERO authentication on upload endpoints
**Location:** `scraper/src/routes/upload_routes.py:49-50`  
```python
# TODO: Extract user_id from authorization header
user_id = "placeholder-user-id"
```
**Impact:** Anyone can upload files to your server. The `user_id` is hardcoded as `"placeholder-user-id"`, meaning all uploads go to a non-existent user. The LDGR folder operations will fail or create orphaned data.  
**Fix:** Implement JWT token validation from the `Authorization` header using Supabase's JWT verification.

### C3. SCRP backend uses `SUPABASE_SERVICE_KEY` — god-mode access
**Location:** `scraper/src/services/ldgr_service.py:18`  
**Impact:** The service key bypasses ALL Row Level Security (RLS) policies. If the SCRP backend is compromised, an attacker has unrestricted read/write access to every user's data in the entire database — files, passwords, API keys, contacts, messages, everything.  
**Fix:** Use the user's JWT token to create a per-request Supabase client that respects RLS. Only use service key for specific admin operations behind proper auth checks.

### C4. SCRP backend CORS allows ALL origins
**Location:** `scraper/api/main.py:30`  
```python
allow_origins=["*"]
```
**Impact:** Any website can make authenticated requests to your API. Combined with C2 (no auth), this means any website can upload files to your server.  
**Fix:** Restrict to known origins: `["https://scraper-frontend-3hnj.onrender.com", "https://roninmedia.studio", "http://localhost:5173"]`

### C5. SCRP upload endpoint returns `temp_path` to the client
**Location:** `scraper/src/routes/upload_routes.py:92`  
```python
"temp_path": temp_path,
```
**Impact:** Exposes internal server filesystem paths to the client. This is an information disclosure vulnerability that aids path traversal attacks.  
**Fix:** Return only a file reference ID, not the server-side path. Store the mapping server-side.

### C6. Supabase anon key hardcoded in `render.yaml`
**Location:** `scraper/render.yaml:37`  
```yaml
VITE_SUPABASE_ANON_KEY: sb_publishable_tAz66t2aypFcvz51fHjXgQ_Ww_-aTqX
```
**Impact:** This file is committed to git. While anon keys are publishable, having credentials in committed YAML files is a bad pattern that leads to accidentally committing secret keys the same way.  
**Fix:** Use Render's environment variable dashboard for all secrets. Reference them with `sync: false` in render.yaml.

### C7. Client-side admin/moderator checks are bypassable
**Location:** `RMG/src/lib/admin.ts:65, 77, 89, 101`  
Every admin function calls `isModerator()` or `isAdmin()` which queries the `user_roles` table, then performs the action. But this is all client-side — the actual Supabase operation uses the user's JWT.  
**Impact:** If RLS policies on `forum_threads`, `forum_posts`, `forum_categories` don't independently verify admin/moderator status, a user could bypass these checks by calling Supabase directly.  
**Fix:** Ensure all admin operations are enforced by RLS policies or Supabase Edge Functions, not just client-side checks.

---

## 🟠 HIGH — Fix Before Next Release

### H1. Two completely different encryption systems in LDGR
**Location:** `RMG/src/lib/ldgr/encryption.ts` vs `RMG/src/lib/ldgr/apiKeys.ts` vs `RMG/src/lib/ldgr/passwords.ts`  
- **File encryption** uses `CryptoJS.AES` (CBC mode, no IV control) — weak
- **API key encryption** uses Web Crypto API with `AES-GCM` + PBKDF2 — strong
- **Password encryption** uses Web Crypto API with `AES-GCM` + PBKDF2 but with a **hardcoded salt** (`'ldgr-passwords-salt'`) — weakened

**Impact:** File encryption is significantly weaker than API key encryption. The CryptoJS AES default mode is CBC without explicit IV, which is vulnerable. Password encryption uses a static salt, reducing PBKDF2 effectiveness.  
**Fix:** Consolidate to a single encryption module using Web Crypto API with AES-256-GCM, random IVs, and per-user salts everywhere. Deprecate CryptoJS.

### H2. Encryption key derived from email — changes break all data
**Location:** `RMG/src/lib/ldgr/encryption.ts:83-84`, `apiKeys.ts:110-116`, `passwords.ts:26-42`  
All encryption keys are derived from the user's email address.  
**Impact:** If a user changes their email, ALL their encrypted files, passwords, and API keys become permanently unrecoverable. There is no key migration path.  
**Fix:** Derive encryption keys from the immutable `user.id` (UUID) instead of email. Or implement a master key system with key wrapping.

### H3. WSPR and RMG duplicate the entire contacts service layer
**Location:**  
- `RMG/src/lib/contacts.ts` (286 lines)
- `wspr-web/client/src/services/rmg-contacts.service.ts` (174 lines)

Both files contain identical logic for `getContacts`, `sendContactRequest`, `acceptContactRequest`, `declineContactRequest`, `searchUsers` — all hitting the same Supabase tables.  
**Impact:** Bug fixes must be applied in two places. Divergence is inevitable.  
**Fix:** Since both apps share the same Supabase instance, keep the logic in one place. Options: (a) npm package, (b) Supabase Edge Functions that both apps call, (c) accept the duplication but document it.

### H4. 20+ SQL migration files littering the RMG root directory
**Location:** `RMG/*.sql` (20 files)  
Files like `fix-folder-creation.sql`, `wspr-schema-reset.sql`, `complete-oauth-fix.sql`, etc.  
**Impact:** These are one-time migration scripts that clutter the repo, confuse contributors, and risk being accidentally re-run. Some contain destructive operations.  
**Fix:** Move to a `migrations/` directory with numbered prefixes (e.g., `001_initial_schema.sql`). Add a `MIGRATIONS.md` documenting which have been applied. Better yet, use Supabase CLI migrations.

### H5. `rmg-components` package was partially created and abandoned
**Location:** `CascadeProjects/rmg-components/`  
A half-built npm package with syntax errors in the ContactsModal component, no tests, and never published.  
**Impact:** Dead code in the workspace. The ContactsModal has a broken JSX tag and will not compile correctly.  
**Fix:** Either complete it properly or delete it. Given the complexity of shared packages, recommend deleting and using approach from H3.

### H6. SCRP `LDGRService` uses synchronous Supabase client with `async` methods
**Location:** `scraper/src/services/ldgr_service.py`  
The `supabase-py` client is synchronous, but the methods are declared `async`. The `await` on `self.create_folder()` etc. doesn't actually do async I/O.  
**Impact:** False sense of async behavior. Under load, these synchronous calls will block the FastAPI event loop.  
**Fix:** Either use `supabase` synchronously (remove `async`/`await`) or switch to `httpx` for truly async Supabase REST calls.

### H7. No rate limiting on any endpoint
**Location:** All of `scraper/api/main.py`, upload routes, process routes  
**Impact:** Vulnerable to abuse — file upload spam, scraping abuse, resource exhaustion.  
**Fix:** Add `slowapi` or similar rate limiting middleware. At minimum: 10 uploads/min, 30 scrapes/min per IP.

### H8. SCRP process routes expose internal error details
**Location:** `scraper/src/routes/process_routes.py:191`  
```python
raise HTTPException(500, f"Document processing failed: {str(e)}")
```
**Impact:** Stack traces and internal error messages leak to the client.  
**Fix:** Log the full error server-side, return a generic error message to the client.

---

## 🟡 MEDIUM — Address During Normal Development

### M1. `Home.tsx` is 43KB — needs decomposition
**Location:** `RMG/src/pages/Home.tsx` (43,822 bytes)  
**Fix:** Extract each app card into its own component. Extract the Arsenal section, hero section, etc.

### M2. No TypeScript strict mode enforcement
**Location:** `RMG/tsconfig.json` — `strict: true` is set but many files use `any` types  
**Examples:** `apiKeys.ts:220`, `passwords.ts:169` use `const updateData: any = {}`  
**Fix:** Replace `any` with proper partial types.

### M3. Two `main` entry points in RMG
**Location:** `RMG/src/main.ts` (274 bytes) and `RMG/src/main.tsx` (236 bytes)  
**Impact:** Confusing. Only one is actually used.  
**Fix:** Remove the unused one.

### M4. Dead files: `counter.ts`, `style.css`, `typescript.svg`, `ForgePage.tsx`, `WSPR.tsx`
**Location:** `RMG/src/`  
These appear to be Vite scaffolding leftovers or abandoned pages.  
**Fix:** Remove them.

### M5. WSPR disables Supabase session persistence
**Location:** `wspr-web/client/src/lib/supabase.ts:12-14`  
```typescript
persistSession: false,
autoRefreshToken: false,
detectSessionInUrl: false
```
**Impact:** WSPR relies entirely on RMG passing the session via postMessage. If the iframe communication fails, WSPR has no fallback.  
**Fix:** This is intentional for the iframe architecture, but add error handling and a "reconnect" UI when the session is lost.

### M6. No error boundaries in React apps
**Location:** `RMG/src/App.tsx`, `wspr-web/client/src/App.tsx`  
**Impact:** A single component crash takes down the entire app with a white screen.  
**Fix:** Add React Error Boundaries around major sections.

### M7. `getUserFolders` makes 2-3 sequential Supabase queries
**Location:** `RMG/src/lib/ldgr/folders.ts:16-49`  
First fetches owned folders, then shared access IDs, then shared folders.  
**Fix:** Create a Supabase RPC function that returns all folders in a single query.

### M8. No input sanitization on forum posts, thread titles, or chat messages
**Location:** `RMG/src/lib/forum.ts`, `wspr-web/client/src/services/`  
**Impact:** Potential XSS if content is rendered with `dangerouslySetInnerHTML` or similar.  
**Fix:** Sanitize all user input before storage. Use DOMPurify for rendering.

### M9. `FloatingEmbers.tsx` is 9.4KB of animation code running on every page
**Location:** `RMG/src/components/FloatingEmbers.tsx`  
**Impact:** Unnecessary CPU/GPU usage, especially on mobile.  
**Fix:** Add `prefers-reduced-motion` support. Consider disabling on mobile or making it opt-in.

### M10. Two separate `requirements.txt` files for SCRP
**Location:** `scraper/requirements.txt` and `scraper/requirements-render.txt`  
**Impact:** They can drift out of sync (which already happened, causing the deployment failure).  
**Fix:** Use a single `requirements.txt`. If Render needs different deps, use a `Dockerfile` or build script.

### M11. No health check or monitoring on WSPR
**Location:** `wspr-web/` — no health endpoint  
**Fix:** Add a `/health` endpoint if there's a backend, or at minimum add error tracking (Sentry).

### M12. `console.log` statements throughout production code
**Location:** Throughout all apps  
**Impact:** Information leakage in browser console, performance overhead.  
**Fix:** Use a logging utility that can be disabled in production. Strip `console.log` in build step.

---

## Architecture Diagram (Current State)

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              RMG (React/Vite)                    │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │    │
│  │  │ LDGR │ │ SCRP │ │ WSPR │ │ OMNI │ │STONKS│  │    │
│  │  │(embed)│ │iframe│ │iframe│ │iframe│ │iframe│  │    │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘  │    │
│  └─────┼────────┼────────┼────────┼────────┼───────┘    │
└────────┼────────┼────────┼────────┼────────┼────────────┘
         │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼
    ┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │Supabase │ │Render│ │Render│ │Render│ │Render│
    │ (direct)│ │(SCRP │ │(WSPR │ │(OMNI │ │(STONK│
    │         │ │ API) │ │ web) │ │ web) │ │  S)  │
    └────┬────┘ └──┬───┘ └──┬───┘ └──────┘ └──────┘
         │         │        │
         ▼         ▼        ▼
    ┌─────────────────────────────┐
    │     Supabase (shared)       │
    │  ┌────────────────────────┐ │
    │  │ Auth / RLS / Storage   │ │
    │  │ Realtime / Edge Funcs  │ │
    │  └────────────────────────┘ │
    └─────────────────────────────┘
```

**Key Issues with Current Architecture:**
1. SCRP backend has direct Supabase access with service key (bypasses RLS)
2. All apps share one Supabase project — no isolation
3. LDGR is embedded directly in RMG, not an iframe — tightest coupling
4. Cross-app auth relies on postMessage — fragile

---

## Recommended Priority Actions

### Phase 1: Security Hardening (1-2 days)
1. **Add `.env` to `.gitignore`** in RMG
2. **Implement JWT auth** on SCRP upload/process endpoints
3. **Restrict CORS** on SCRP backend
4. **Remove `temp_path`** from upload response
5. **Remove hardcoded Supabase key** from `render.yaml`

### Phase 2: Encryption Consolidation (2-3 days)
1. **Create unified encryption module** using Web Crypto API
2. **Migrate file encryption** from CryptoJS to Web Crypto
3. **Fix password salt** to be per-user instead of hardcoded
4. **Change key derivation** from email to user ID

### Phase 3: Code Cleanup (1-2 days)
1. **Move SQL files** to `migrations/` directory
2. **Delete dead files** (`counter.ts`, `style.css`, `ForgePage.tsx`, etc.)
3. **Delete `rmg-components`** package (or complete it)
4. **Consolidate `requirements.txt`** files for SCRP
5. **Decompose `Home.tsx`** into smaller components

### Phase 4: Architecture Improvements (3-5 days)
1. **Add rate limiting** to SCRP backend
2. **Add React Error Boundaries** to RMG and WSPR
3. **Create Supabase RPC functions** for multi-query operations
4. **Add `prefers-reduced-motion`** support
5. **Strip console.logs** in production builds

---

## Summary Table

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 7 | Security vulnerabilities |
| 🟠 High | 8 | Security + Architecture |
| 🟡 Medium | 12 | Code quality + Performance |
| **Total** | **27** | |

The most urgent items are **C1-C5** (security). These should be addressed before any new feature development. The encryption consolidation (H1-H2) should follow immediately after, as it affects data integrity for all LDGR users.
