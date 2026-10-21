# Immigration Suite — Separate Product

> **Ye folder Education Consultancy ERP se physically alag hai.** Ye ek independent
> product hai jo (future mein) apna alag repo / standalone Django project ban sakta hai.

## Kya hai is folder mein?

| App | Old location | Purpose |
|---|---|---|
| `immigration/visas/` | `apps/crm/visas/` | VisaCase, VisaMilestone (CAS, VFS, biometrics, TB test, IHS, appeals) |
| `immigration/compliance/` | `apps/operations/compliance/` | ComplianceRule, ComplianceRuleChange (country visa rule updates) |

Django app **labels** (`visas`, `compliance`) wahi rakhe gaye hain, is liye
database tables, `django_migrations` history aur API shapes **100% unchanged** hain.

## Feature flag (ERP standalone sell karne ke liye)

**Backend** (`visa_crm_backend/settings.py`):

```
ENABLE_IMMIGRATION_MODULE=True   # .env mein False karo to modules unmount ho jayenge
```

- `False` karne se `immigration.visas` + `immigration.compliance` INSTALLED_APPS se
  hatt jayenge aur `/api/v1/visas/*`, `/api/v1/compliance/*` URLs mount nahi honge.
- Baqi ERP (students, applications, finance, marketing, HR, branches...) normal chalega.

**Frontend** (`bwbs-crm-frontend/.env`):

```
VITE_ENABLE_IMMIGRATION=true   # false karo to Visa tabs/nav hidden ho jayenge
```

Gated UI:
- Admin portal: `/admin/visas`, `/admin/visas/analytics`, `/admin/compliance` routes + "Global Visa Cases" nav item (`src/config/features.ts` → `ENABLE_IMMIGRATION`)
- Employee portal: `/employee-portal/visa-cases` route + "Visa Cases" nav item
- Portal `/me` API `visa_cases: []` return karega (backend guard)

## Cross-app imports (guards lagay hue)

Sirf 4 jagah ERP ke andar immigration models use hote the — sab par
`settings.ENABLE_IMMIGRATION_MODULE` based guards hain, is liye flag=False par
import hota hi nahi aur crash nahi hota:

1. `apps/crm/students/views.py` — DashboardStatsView (pending_visas, visa_alerts → flag off par 0/[])
2. `apps/platform/portal/views.py` — Portal /me `visa_cases` key (flag off par `[]`)
3. `apps/crm/applications/services.py` — CAS_RECEIVED par VisaCase auto-create (flag off par skip)
4. `apps/platform/core/management/commands/seed_data.py` — visa seeding skip

## Extraction roadmap (jab standalone banana ho)

1. Is folder ko naya repo mein copy karo
2. Naya Django project scaffold karo (`immigration/settings.py`, own `urls.py`)
3. Models mein `TenantAwareModel` (platform dependency) ko ek local base class se replace karo
4. Migration files `dependencies` (`('students', ...)`) clean karo — students app yahan nahi hoga
5. Frontend `visa.ts` + Visa components ko naya frontend package banao

Filhaal ye ERP ke sath hi deploy hota hai (same DB, same auth) — sirf folder-level
separation hai, jo Phase 1 SaaS work ke liye clean base deti hai.
