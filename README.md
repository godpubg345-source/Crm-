# Education Consultancy ERP

End-to-end Education Consultancy ERP for managing leads, students, applications, finance, and branch operations.

> 📖 **Portal architecture & audit:** See [CROSS_PORTAL_ANALYSIS.md](./CROSS_PORTAL_ANALYSIS.md) — 5 portals, auth tracks, data-flow bridges, and known issues.

## Repository Layout
- `visa_crm_backend/` Django backend
- `bwbs-crm-frontend/` React frontend
- `immigration/` **Immigration Suite (separate product)** — `visas/` + `compliance/` Django apps, `ENABLE_IMMIGRATION_MODULE` flag se on/off (see [`immigration/README.md`](./immigration/README.md))
- `extras/` Documentation, utility scripts, and miscellaneous artifacts
- `docker-compose.yml` Local stack (Postgres + Redis + backend)

## Quick Start (Docker)
1. Copy `.env.example` to `.env` and fill required values.
2. Run:

```powershell
Docker Compose up --build
```

Backend runs on `http://localhost:8000/api/v1`.

## Local Development

### Backend
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```powershell
cd bwbs-crm-frontend
npm install
npm run dev
```

## Environment Variables
Use `.env.example` as the baseline. Common keys:
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `PAYROLL_TAX_RATE` (default `0.20`)

## Notes
- The API base URL for the frontend is set via `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`).
- Branch context can be scoped via `X-Branch-ID` (managed automatically by the frontend).
