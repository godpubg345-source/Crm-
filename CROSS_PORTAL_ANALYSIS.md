# Cross-Portal Relationship Analysis

> **Project:** Education Consultancy ERP (formerly BWBS Education CRM)
> **Generated:** 2026-10-17
> **Scope:** Full scan of backend (`apps/`, `visa_crm_backend/`) + frontend (`bwbs-crm-frontend/`)

---

## 1. Project Overview

End-to-end **Education Consultancy ERP** — leads, students, applications, visas, finance, aur multi-branch operations ka management.

| Layer | Technology |
|---|---|
| Backend | Django 6.0.2 + DRF 3.16, SimpleJWT (15min access / 7d refresh, rotation + blacklist), Celery + Redis, drf-spectacular |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Frontend | React 19 + TypeScript + Vite 7, Tailwind 4, TanStack Query, React Router 7, Recharts, Framer Motion, dnd-kit, xlsx |
| Infra | Docker Compose (Postgres + Redis + backend), S3 optional (boto3), WhiteNoise, Gunicorn, PDF (reportlab/xhtml2pdf/pyHanko) |

### Code Stats
- Backend: ~336 Python files (DDD structure in `apps/`)
- Frontend: ~195 files in `src/`

---

## 2. Portals (5 total)

| # | Portal | Route | Files | Entry Point |
|---|---|---|---|---|
| 1 | Admin (Master CRM) | `/admin` | 58 | `Login.tsx` (staff login) |
| 2 | CEO | `/ceo` | 10 | `Login.tsx` (role-routed) |
| 3 | Employee | `/employee-portal` | 15 | `EmpLogin.tsx` / `Login.tsx` |
| 4 | Student | `/portal` | 9 | `PortalLogin.tsx` (magic/token, no password) |
| 5 | Public website | `/` (fallback `/*`) | 6 | Home, Booking, MagicUpload |

---

## 3. Relationship Map

```
                    ┌─────────────────────────────────────┐
                    │   STAFF JWT (1 shared token store)  │
                    │   login: /login  •  EmpLogin: same  │
                    └──────────┬───────────────┬──────────┘
                               │               │
              role-route karta hai ▼           ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
   │ /admin       │   │ /ceo         │   │ /employee-portal │
   │ SUPER_ADMIN, │   │ CEO,         │   │ koi bhi auth     │
   │ COUNTRY_MGR, │   │ SUPER_ADMIN, │   │ staff (koi role  │
   │ AUDITOR      │   │ COUNTRY_MGR  │   │ check nahi!)     │
   └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘
          │                  │                    │
          │   baaki roles yahan redirect: /employee-portal
          │
          ▼  preview mode (apna JWT token bhi chalega)
   ┌─────────────────────────────────────────────────────┐
   │ /portal (STUDENT) — alag session (PortalAccess, 7d) │
   └──────┬──────────────────────────────▲───────────────┘
          │ READS                        │ token
          ▼                              │
   ┌─────────────────────────────────────────────────────┐
   │ CRM DATABASE (students, applications, visas,        │
   │ documents, payments) — sab portals isi ko dekhte hain│
   └──────▲───────────────────────────────────────────────┘
          │ uploads
   ┌──────┴───────────────┐
   │ /magic-upload/:token │ ← Public page (koi auth nahi, sirf token)
   └──────────────────────┘
```

---

## 4. Auth Tracks (3 alag mechanisms)

| Track | Kaun use karta hai | Mechanism |
|---|---|---|
| **Staff JWT** | Admin + Employee + CEO portals (+ Admin→Student preview) | SimpleJWT — shared `authStore` (localStorage `bwbs_access_token`). Admin aur Employee portal ka token **bilkul same** hai. Refresh token httpOnly cookie mein |
| **Portal session** | Student portal | `PortalAccess` model + `session_token`, 7 din expiry (`PORTAL_SESSION_DAYS`). Student User nahi hota — CRM Student model hai |
| **Magic link** | Public upload page | `MagicLink` model, token default 48h expiry, `AllowAny` + `MagicLinkPublicThrottle` |

### Role Routing (`Login.tsx`)
| Role | Destination |
|---|---|
| CEO, COUNTRY_MANAGER | `/ceo` |
| SUPER_ADMIN, HQ_STAFF*, AUDITOR | `/admin` |
| BRANCH_MANAGER, CONSULTANT*, EMPLOYEE*, COUNSELLOR*, COUNSELOR, FINANCE_OFFICER, DOC_PROCESSOR, ADMISSION_OFFICER* | `/employee-portal` |
| STUDENT* | `/portal` |
| fallback | `/admin` |

\* = phantom role (backend mein exist nahi karta — dekho Issue #3)

### Guards
| Guard | File | Allowed |
|---|---|---|
| `AdminAuthGuard` | `src/portals/admin/AdminAuthGuard.tsx` | SUPER_ADMIN, COUNTRY_MANAGER, AUDITOR, HQ_STAFF* — baaki ko `/employee-portal` redirect |
| `CeoAuthGuard` | `src/portals/ceo/CeoAuthGuard.tsx` | CEO, SUPER_ADMIN, COUNTRY_MANAGER |
| `EmpPortalAuthGuard` | `src/portals/employee/EmpPortalAuthGuard.tsx` | Koi bhi authenticated staff (sirf token check) |
| `PortalAuthGuard` | `src/portals/student/PortalAuthGuard.tsx` | Portal session **YA** admin JWT (preview) |

---

## 5. Backend Roles (source of truth)

`apps/identity/accounts/models.py` — `User.Role`:
`SUPER_ADMIN`, `COUNTRY_MANAGER`, `BRANCH_MANAGER`, `COUNSELOR`, `FINANCE_OFFICER`, `DOC_PROCESSOR`, `AUDITOR`, `CEO`

Frontend mirror: `src/types/user.ts` — `UserRole` (same 8) + `BRANCH_SWITCHING_ROLES` = `[SUPER_ADMIN, AUDITOR, COUNTRY_MANAGER, CEO]` (yeh log `X-Branch-ID` se branch switch kar sakte hain).

---

## 6. Data Flow Bridges (asli cross-portal relationships)

### 6.1 Staff → Student: Magic Link Flow
```
SmartChecklist.tsx (staff, student file view)
   → createMagicLink(studentId, requirementIds)     [src/services/magicLinks.ts]
   → POST /api/v1/magic-links/                       [ManageMagicLinkViewSet — staff only]
       • BranchIsolationMixin  → dusri branch ke liye block
       • Counselor scope       → sirf apne students ke liye
       • AuditLogMixin         → har action log
       • MagicLink create (48h default expiry)
   → URL: https://crm.bwbs.com/magic-upload/{token}   ← HARDCODED (Issue #1)
   → Student opens PUBLIC page /magic-upload/:token   [MagicUpload.tsx]
   → PublicMagicLinkView validates token (AllowAny + throttle)
   → Document upload → apps/crm/students Document
   → Document ab Admin CRM + Student Portal DONO mein visible
```

### 6.2 Student Portal = CRM ka Read-Only Mirror
`PortalMeResponse` (`src/services/portal.ts`) — sab CRM models se aggregate:
- Student profile (+ **counselor details** — full name, email, photo → counselor-student relationship directly expose hoti hai)
- Applications, Visa cases, Documents, Payments, Notifications — sab `apps.crm.*` se

### 6.3 Public Booking
`/booking/:counselorId` → visitor staff counselor ko appointment book karta hai (`engagement.appointments`).

### 6.4 Branch Context
`X-Branch-ID` header (axios instance automatic) → `apps/operations/branches/middleware/BranchMiddleware` → saare queries branch-scoped. Frontend `CORS_ALLOW_HEADERS` mein `x-branch-id` allowlisted.

### 6.5 Demo Bridge
Login.tsx quick-login STUDENT button → `portalLogin('65888f23-1053-4881-a70d-381d5cc6f87c')` → backend `DEMO_TOKEN` match → demo student (`priya.sharma@example.com`) ka portal.

---

## 7. Issues Found (ranked)

### 🔴 #1 — Hardcoded Magic Link URL
- **File:** `apps/platform/magic_links/views.py:70`
- Har generated link `https://crm.bwbs.com/magic-upload/{token}` bhejta hai. Comment khud kehta hai *"Mocking full URL. In real app: settings.FRONTEND_URL + /upload/ + token"*
- **Impact:** Production mein wrong domain — links toot jayenge.
- **Fix:** `settings.FRONTEND_URL` (env-driven) use karo.

### 🔴 #2 — Demo Backdoor in Student Portal
- **File:** `apps/platform/portal/views.py:123-137` (`PortalAuthView.post`)
- Accepts `'demo'`, `'demo-token'`, `'student@bwbs.com'`, aur hardcoded UUID. Agar demo student na mile to **DB ka pehla student** (`Student.objects.first()`) login kar deta hai.
- **Impact:** Production mein koi bhi (token ke bina) kisi bhi student ka portal khol sakta hai.
- **Fix:** Demo logic ko settings flag (`ENABLE_PORTAL_DEMO`, default False) ke peechay rakho.

### 🟡 #3 — Phantom Roles (frontend vs backend mismatch)
- Frontend mein exist karte hain, backend `User.Role` mein **nahi**:
  - `HQ_STAFF` (AdminAuthGuard, Login.tsx, PortalAuthGuard)
  - `CONSULTANT` (Login.tsx, PortalAuthGuard)
  - `ADMISSION_OFFICER` (Login.tsx, PortalAuthGuard)
  - `EMPLOYEE`, `STUDENT` (Login.tsx — dead routing branches)
  - `COUNSELLOR` (British spelling — backend `COUNSELOR` hai; Login.tsx dono rakhta hai ✓ lekin PortalAuthGuard sirf `COUNSELLOR` rakhta hai)
- **Impact:** `PortalAuthGuard` mein spelling mismatch ki wajah se COUNSELOR staff student-portal preview se block hota hai. Baaki phantom entries misleading dead-code hain.

### 🟡 #4 — CEO Misroute
- CEO agar seedha `/admin` khol le → `AdminAuthGuard` use `/employee-portal` pe redirect karta hai. Sahi destination `/ceo` hona chahiye.

### 🟡 #5 — Branch Manager / Counselor Admin se Bahar
- `AdminAuthGuard` sirf SUPER_ADMIN/COUNTRY_MANAGER/AUDITOR (+ phantom HQ_STAFF) ko andar deta hai.
- Lekin Admin UI mein BRANCH_MANAGER-specific permission checks hain (`Leads.tsx:60` `canAssignLeads`) = dead code.
- **Decision chahiye:** ya to branch staff ko Admin access do, ya in UI checks ko hatao.

### 🟢 #6 — Admin = Employee Same Session
- Dono portals ek hi JWT use karte hain; Employee portal mein koi role check nahi — koi bhi staff token `/employee-portal` mein aa sakta hai. UI-only restriction hai; data pe backend permissions lagte hain is liye data safe hai.

### ✅ Jo Theek Hai
- Backend write-side solid: magic links pe branch isolation + counselor ownership + throttling (`user: 100/min, anon: 20/min, login: 10/min, magic_link: 30/min`) + audit logging
- Security hardening auto when `DEBUG=False` (HSTS, SSL redirect, secure cookies)
- Login lockout (5 attempts / 15 min), password complexity validator
- Upload validation (10MB, pdf/jpg/png) + `validate_upload` utility

---

## 8. Non-Critical Warnings

| # | Warning |
|---|---|
| 1 | **AdminApp chunk 3.1MB** (gzip 826KB) — build limit 500KB se bara. Code-splitting / `manualChunks` recommended |
| 2 | `services/universities.ts` dynamic + static dono tarah import hota hai (OperationsHub vs 6 files) — chunking warning |
| 3 | Repo mein stale artifacts: `runserver_err.txt`, `check_err.txt`, `build_errors.txt`, `lint_report.json` (dosri machine "Omen" se), fix-scripts (`fix_*.py`, `*.cjs`), 68MB recording mp4 |
| 4 | `.env` repo folder mein maujood hai — push se pehle secrets check karo |

---

## 9. Rename History (2026-10-17)

- Project renamed: **"BWBS Education CRM" → "Education Consultancy ERP"** (39 + 22 files)
- UI de-brand complete: saare "BWBS" display texts hata diye (logins, layouts, email templates, payslip, invoice, docs)
- **Intentionally kept (functional):**
  - Demo emails (`admin@bwbs.com`, `counselor.isb@bwbs.com`, ...) — `seed_data.py` inhi users ko banata hai
  - localStorage keys (`bwbs_access_token`, `bwbs_user`) — change = sab logged-out
  - Logo file `bwbs-logo.png` — har portal use karta hai
  - Demo token `65888f23-1053-4881-a70d-381d5cc6f87c` — Login.tsx ↔ PortalAuthView ka demo bridge

---

## 10. Verification Results (2026-10-17)

| Check | Result |
|---|---|
| `manage.py check` | ✅ `System check identified no issues (0 silenced)` |
| `manage.py makemigrations --check` | ✅ `No changes detected` |
| `npm run build` (tsc -b + vite) | ✅ built in 8.76s (3620 modules) |
| Purani error files | Stale thi (dosri machine se, Feb 9) — current code clean hai |

---

## 11. Live API Audit (2026-10-17) — "APIs toot rahi hain" ki asal wajah

### Methodology
1. Django URL resolver se saare registered routes dump kiye (ground truth)
2. `endpoints.ts` (frontend central map) ↔ backend routes diff — **100% aligned mila**
3. Live HTTP audit: admin login → **71/71 GET endpoints = 200 OK**
4. Detail routes real IDs ke saath (students/leads/branches/tasks/applications/universities/courses) — **7/7 = 200**
5. Portal flow (demo token → `/portal/me/` → logout) — **200 OK**
6. Fir hardcoded service paths grep kiye — yahan asli bugs mile

### 🔴 Broken APIs Mile + Fix Kiye

| # | File | Broken Call | Backend Reality | Impact | Fix |
|---|---|---|---|---|---|
| 1 | `services/visa.ts` | GET/POST/PATCH/DELETE `/visa-cases/*` (5 calls) | Route `/visas/cases/*` hai | **Pura Visa tab 404** — list, detail, create, update, delete sab dead | `/visa-cases/` → `/visas/cases/` (5 replacements) |
| 2 | `services/visa.ts` | GET/POST/PATCH/DELETE `/visa-milestones/*` (4 calls) | Route `/visas/milestones/*` | Milestones 404 — create/update/delete dead | `/visa-milestones/` → `/visas/milestones/` (4 replacements) |
| 3 | `services/marketing.ts` | GET/POST `/campaigns/campaigns/` | Route `/campaigns/` hai | **Admin Marketing module 404** | Paths fixed → `/campaigns/` |
| 4 | `services/marketing.ts` | GET `/campaigns/{id}/stats/` | Aisa koi action backend mein nahi | Stats dead | Detail route pe fallback |
| 5 | `services/empPortal.ts` | GET `/messaging/threads/`, POST `/messaging/messages/`, GET `/messaging/threads/{id}/messages/` | Threads system backend mein exist nahi karta (sirf `/messaging/logs/` + `/messaging/templates/`) | **Employee portal Messages page 404** | `empGetMessages` → `/messaging/logs/`, `empSendMessage` → POST `/messaging/logs/`, thread fn → filtered logs |
| 6 | `portals/employee/EmpMessages.tsx` | Thread-shaped fields render (`thread.last_message`, `unread_count`) | MessageLog fields: `subject`, `body`, `recipient`, `status`, `created_at` | Shape mismatch | Rendering MessageLog fields pe adapt kiya |

### ✅ Verification (baad mein)
`/campaigns/` 200 • `/visas/cases/` 200 • `/visas/milestones/` 200 • `/messaging/logs/` GET+POST 200 • `/magic-links/public/{token}/` fake token pe 404 (route sahi reject karta hai) • `npm run build` ✅ 10.25s

### ⚠️ Baqi Choti Cheezein
| # | Issue |
|---|---|
| 1 | MagicLink **list serializer** `token`/`url` return nahi karta (create response deta hai ✓) — list UI mein link copy karne ka data missing |
| 2 | `staff_isb@bwbs.com` (BRANCH_MANAGER) password `admin123` se 401 — seed creds outdated; quick-login users (admin, staff_uk, employee) kaam karte hain |
| 3 | `counselor.isb@bwbs.com` jaise purane seed users DB mein exist nahi karte — `seed_data.py` aur DB out of sync |
| 4 | User throttle `100/min` — admin dashboard bahut se parallel queries fire karta hai; heavy use pe 429 possible |

### Note
Backend kisi bhi standard endpoint pe nahi toot raha tha - tootne ki asal wajah **frontend services ke hardcoded purane paths** thi (DDD migration se pehle ke), jo `endpoints.ts` ko bypass karte the.

---

## 12. Immigration Suite Separation (2026-10-17)

**Business context:** Product 100-200 consultancies ko SaaS ke tor pe bechna hai. Visa/immigration functionality ek **alag product** hai, is liye ERP se physically separate kiya gaya.

### Kya kiya

| Step | Detail |
|---|---|
| Physical move | `apps/crm/visas/` → `immigration/visas/` aur `apps/operations/compliance/` → `immigration/compliance/` (migrations samet) |
| App labels | `visas` / `compliance` **unchanged** — DB tables, `django_migrations` history, API shapes sab same |
| AppConfig | `name = 'immigration.visas'` / `'immigration.compliance'` |
| Feature flag | `ENABLE_IMMIGRATION_MODULE` (settings, `.env`, default `True`) — `False` par INSTALLED_APPS + URL mounting skip |
| URL mounting | `/api/v1/visas/*` + `/api/v1/compliance/*` ab `settings.ENABLE_IMMIGRATION_MODULE` par guarded |
| Import guards | 4 cross-app imports ab `settings.ENABLE_IMMIGRATION_MODULE` based guards (students/views.py dashboard, portal/views.py `/me`, applications/services.py CAS automation, seed_data.py) — flag off par import hi nahi hota, values 0/[] |
| Frontend flag | `VITE_ENABLE_IMMIGRATION` (`src/config/features.ts` → `ENABLE_IMMIGRATION`) |
| Frontend gating | Admin: `/admin/visas`, `/admin/visas/analytics`, `/admin/compliance` routes + "Global Visa Cases" nav item; Employee: `visa-cases` route + nav item — flag false par hidden |
| Env files | Root `.env` + `.env.example` (backend flag), `bwbs-crm-frontend/.env` (frontend flag) |
| Docs | `immigration/README.md` — product split ki poori detail + extraction roadmap |

### Dependencies scan (move se pehle)

- `apps.crm.visas` ke **sirf 4 external imports** the (upar guards) — baqi sab app-internal
- `apps.operations.compliance` ke **0 external imports** the
- Migration files mein koi purana package path hardcoded nahi tha
- Internal imports (identity, platform, students, applications) waise hi kaam karte hain

### Verification

- `manage.py check` → clean, `makemigrations --check` → no changes (labels same hone se DB compatible)
- `npm run build` → ✓ built in 7.32s
- **Flag=True (default):** live `/visas/cases/`, `/compliance/rules/`, `/dashboard/stats/`, `/students/` = **200 OK**; fresh-process check `True|True` (flag + app installed)
- **Flag=False (standalone ERP mode):** fresh-process Django boot successful **bina** immigration apps ke (`False|False`); `/api/v1/visas/cases/` route unmounted (Resolver404); ERP endpoints (students/dashboard) normal — guards 0/[] values dete hain
- Note: PS 5.1 `Set-Content -Encoding UTF8` .env mein BOM daal deta hai jo django-environ ko "Invalid line" warning deta hai — .env hamesha `UTF8Encoding($false)` se likhein

### SaaS impact

- Ab ERP standalone sell ho sakta hai (`ENABLE_IMMIGRATION_MODULE=False` + `VITE_ENABLE_IMMIGRATION=false`)
- Immigration Suite baad mein alag product/subscription ke tor pe offer ho sakti hai
- Note: visa yahan sirf **student visa processing** thi; actual "immigration office" features (client immigration cases) ka koi lena dena nahi tha — ye ERP student-focused hi hai

---

## 13. Student Profile UI/Data Cleanup (2026-10-17)

Admin student profile page pe aui issues pakde gaye aur fix kiye:

| # | Issue (screenshot wala) | Asal wajah | Fix |
|---|---|---|---|
| 1 | **`BWBS-LON-1006`** student code | `scripts/seed_counselor_demo.py` hardcoded `BWBS-LON-{n}` template | Template → `LON-{n}` + DB update: 6 rows `BWBS-LON-100x` → `LON-100x` (BWBS_LEFT=0) |
| 2 | **"Academic Application Vault" / "Strategic Dossier" / "New Prospectus Entry"** | `ApplicationsTab.tsx` mein pompous/bakwas branding | Clean text: "Applications", "N applications on record", "New Application", "No Applications Yet" |
| 3 | **"Level" / "Duration" khali placeholders** | `ApplicationListSerializer` ne `course` FK sirf PK return kiya — frontend `.level/.duration` undefined | Backend: `course_level` + `course_duration` SerializerMethodFields added; frontend chips ab data na ho to **hidden** |
| 4 | **"Passport Credentials", "Phone Line", "Institutional Branch", "Assigned Strategic Counselor"** | StudentDetail labels | Plain: "Passport Number", "Phone", "Branch", "Assigned Counselor", "Nationality" |
| 5 | **"Scholar Journey Lifecycle"** | StudentDetail heading | "Admission Journey" |
| 6 | **Footer "ERP Intelligence Protocol v2.4.0 Strategic Compliance Active"** | `DashboardLayout.tsx` fake branding | "Education Consultancy ERP • All Portals Active" |
| 7 | **"Profile — 100% Complete" false claim** | Journey stage static description | "Profile Ready" |
| 8 | **VISA tab (StudentDetail) un-gated** | Immigration split waqt sirf routes/nav gate hue the, tabs nahi | `ENABLE_IMMIGRATION` gate laga (tabs filter + content guard) |

### Verification

- `manage.py check` clean; live application list `course_level`/`course_duration` return karta hai
- `npm run build` pass
- DB: 6 seed students ke codes BWBS-free; seed template bhi fixed (future re-seed safe)
