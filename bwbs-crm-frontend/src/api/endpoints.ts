// ============================================================================
// CENTRALIZED API ENDPOINTS - Education Consultancy ERP
// All API URLs in one place. No more hardcoded strings in service files.
// ============================================================================

export const API_ENDPOINTS = {
  // ─── Authentication ──────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    VERIFY: '/auth/verify/',
    LOGOUT: '/auth/logout/',
  },

  // ─── Users & Identity ────────────────────────────────────────────────
  USERS: {
    LIST: '/users/',
    DETAIL: (id: string) => `/users/${id}/`,
    ME: '/users/me/',
    PERFORMANCE: '/users/performance/',
    LEADERBOARD: '/users/leaderboard/',
    CHANGE_PASSWORD: '/users/change-password/',
    STATS: (id: string) => `/users/${id}/stats/`,
    GENERATE_PAYROLL: (id: string) => `/users/${id}/generate_payroll/`,
    PAYROLL_REPORT: (id: string) => `/users/${id}/payroll_report/`,
    UPDATE_SPECIALTIES: (id: string) => `/users/${id}/update_specialties/`,
  },

  ATTENDANCE: {
    LIST: '/attendance/',
    DETAIL: (id: string) => `/attendance/${id}/`,
    CLOCK_OUT_ALL: '/attendance/clock-out-all/',
    EXPORT: '/attendance/export/',
  },

  LEAVE_REQUESTS: {
    LIST: '/leave-requests/',
    DETAIL: (id: string) => `/leave-requests/${id}/`,
    APPROVE: (id: string) => `/leave-requests/${id}/approve/`,
    REJECT: (id: string) => `/leave-requests/${id}/reject/`,
  },

  AUDIT_LOGS: {
    LIST: '/audit-logs/',
    DETAIL: (id: string) => `/audit-logs/${id}/`,
  },

  // ─── CRM: Students & Leads ──────────────────────────────────────────
  DASHBOARD: {
    STATS: '/dashboard/stats/',
  },

  LEADS: {
    LIST: '/leads/',
    DETAIL: (id: string) => `/leads/${id}/`,
    ARCHIVE: (id: string) => `/leads/${id}/archive/`,
    CONVERT: (id: string) => `/leads/${id}/convert/`,
  },

  LEAD_INTERACTIONS: {
    LIST: '/lead-interactions/',
    DETAIL: (id: string) => `/lead-interactions/${id}/`,
  },

  WHATSAPP_TEMPLATES: {
    LIST: '/lead-whatsapp-templates/',
    DETAIL: (id: string) => `/lead-whatsapp-templates/${id}/`,
  },

  COUNSELOR_AVAILABILITY: {
    LIST: '/counselor-availability/',
    DETAIL: (id: string) => `/counselor-availability/${id}/`,
  },

  STUDENTS: {
    LIST: '/students/',
    DETAIL: (id: string) => `/students/${id}/`,
  },

  DOCUMENTS: {
    LIST: '/documents/',
    DETAIL: (id: string) => `/documents/${id}/`,
  },

  DOCUMENT_ALERTS: {
    LIST: '/document-alerts/',
    DETAIL: (id: string) => `/document-alerts/${id}/`,
  },

  // ─── CRM: Applications ──────────────────────────────────────────────
  APPLICATIONS: {
    LIST: '/applications/',
    DETAIL: (id: string) => `/applications/${id}/`,
  },

  APPLICATION_SUBMISSIONS: {
    LIST: '/application-submissions/',
    DETAIL: (id: string) => `/application-submissions/${id}/`,
  },

  APPLICATION_CHECKLIST_TEMPLATES: {
    LIST: '/application-checklist-templates/',
    DETAIL: (id: string) => `/application-checklist-templates/${id}/`,
  },

  APPLICATION_CHECKLIST_ITEMS: {
    LIST: '/application-checklist-items/',
    DETAIL: (id: string) => `/application-checklist-items/${id}/`,
  },

  APPLICATION_NOTES: {
    LIST: '/application-notes/',
    DETAIL: (id: string) => `/application-notes/${id}/`,
  },

  // ─── CRM: Visas ─────────────────────────────────────────────────────
  VISAS: {
    CASES: '/visas/cases/',
    CASE_DETAIL: (id: string) => `/visas/cases/${id}/`,
    MILESTONES: '/visas/milestones/',
    MILESTONE_DETAIL: (id: string) => `/visas/milestones/${id}/`,
  },

  // ─── Operations ─────────────────────────────────────────────────────
  BRANCHES: {
    LIST: '/branches/',
    DETAIL: (id: string) => `/branches/${id}/`,
  },

  BRANCH_TRANSFERS: {
    LIST: '/branch-transfers/',
    DETAIL: (id: string) => `/branch-transfers/${id}/`,
  },

  BRANCH_TARGETS: {
    LIST: '/branch-targets/',
    DETAIL: (id: string) => `/branch-targets/${id}/`,
  },

  FIXED_ASSETS: {
    LIST: '/fixed-assets/',
    DETAIL: (id: string) => `/fixed-assets/${id}/`,
  },

  BRANCH_COMPLAINTS: {
    LIST: '/branch-complaints/',
    DETAIL: (id: string) => `/branch-complaints/${id}/`,
  },

  FINANCE: {
    FEES: '/finance/fees/',
    FEE_DETAIL: (id: string) => `/finance/fees/${id}/`,
    TRANSACTIONS: '/finance/transactions/',
    TRANSACTION_DETAIL: (id: string) => `/finance/transactions/${id}/`,
    COMMISSIONS: '/finance/commissions/',
    COMMISSION_DETAIL: (id: string) => `/finance/commissions/${id}/`,
  },

  TASKS: {
    LIST: '/tasks/',
    DETAIL: (id: string) => `/tasks/${id}/`,
  },

  COMPLIANCE: {
    RULES: '/compliance/rules/',
    RULE_DETAIL: (id: string) => `/compliance/rules/${id}/`,
    CHANGES: '/compliance/changes/',
    CHANGE_DETAIL: (id: string) => `/compliance/changes/${id}/`,
  },

  GOVERNANCE: {
    RETENTION_POLICIES: '/governance/retention-policies/',
    DATA_DELETIONS: '/governance/data-deletions/',
    ACCESS_REVIEWS: '/governance/access-reviews/',
    ACCESS_REVIEW_ITEMS: '/governance/access-review-items/',
  },

  OPERATIONS: {
    CONTRACTS: '/operations/contracts/',
    CONTRACT_DETAIL: (id: string) => `/operations/contracts/${id}/`,
    AGENTS: '/operations/agents/',
    AGENT_DETAIL: (id: string) => `/operations/agents/${id}/`,
    AGENT_ASSIGNMENTS: '/operations/agent-assignments/',
    OCR_JOBS: '/operations/ocr-jobs/',
  },

  // ─── Partners ───────────────────────────────────────────────────────
  UNIVERSITIES: {
    LIST: '/universities/',
    DETAIL: (id: string) => `/universities/${id}/`,
  },

  COURSES: {
    LIST: '/courses/',
    DETAIL: (id: string) => `/courses/${id}/`,
  },

  WISHLISTS: {
    LIST: '/wishlists/',
    DETAIL: (id: string) => `/wishlists/${id}/`,
  },

  LIVING_COSTS: {
    LIST: '/living-costs/',
    DETAIL: (id: string) => `/living-costs/${id}/`,
  },

  COURSE_REVIEWS: {
    LIST: '/course-reviews/',
    DETAIL: (id: string) => `/course-reviews/${id}/`,
  },

  CAREER_PATHS: {
    LIST: '/career-paths/',
    DETAIL: (id: string) => `/career-paths/${id}/`,
  },

  QUICK_APPLIES: {
    LIST: '/quick-applies/',
    DETAIL: (id: string) => `/quick-applies/${id}/`,
  },

  // ─── Engagement ─────────────────────────────────────────────────────
  COMMUNICATIONS: {
    LIST: '/communications/',
    DETAIL: (id: string) => `/communications/${id}/`,
  },

  REVIEW_SLAS: {
    LIST: '/review-slas/',
    DETAIL: (id: string) => `/review-slas/${id}/`,
  },

  DOCUMENT_REVIEWS: {
    LIST: '/document-reviews/',
    DETAIL: (id: string) => `/document-reviews/${id}/`,
  },

  MESSAGING: {
    TEMPLATES: '/messaging/templates/',
    TEMPLATE_DETAIL: (id: string) => `/messaging/templates/${id}/`,
    LOGS: '/messaging/logs/',
    LOG_DETAIL: (id: string) => `/messaging/logs/${id}/`,
  },

  CAMPAIGNS: {
    LIST: '/campaigns/',
    DETAIL: (id: string) => `/campaigns/${id}/`,
    STEPS: '/campaign-steps/',
    STEP_DETAIL: (id: string) => `/campaign-steps/${id}/`,
    ENROLLMENTS: '/campaign-enrollments/',
    ENROLLMENT_DETAIL: (id: string) => `/campaign-enrollments/${id}/`,
    ACTIVITIES: '/campaign-activities/',
    ACTIVITY_DETAIL: (id: string) => `/campaign-activities/${id}/`,
  },

  APPOINTMENTS: {
    LIST: '/appointments/',
    DETAIL: (id: string) => `/appointments/${id}/`,
    REMINDERS: '/appointment-reminders/',
    REMINDER_DETAIL: (id: string) => `/appointment-reminders/${id}/`,
  },

  // ─── Platform ───────────────────────────────────────────────────────
  AUTOMATION: {
    RULES: '/automation/rules/',
    RULE_DETAIL: (id: string) => `/automation/rules/${id}/`,
    RUNS: '/automation/runs/',
    ESCALATIONS: '/automation/escalations/',
  },

  ANALYTICS: {
    REPORTS: '/analytics/reports/',
    INPUTS: '/analytics/inputs/',
    SNAPSHOTS: '/analytics/snapshots/',
  },

  PORTAL: {
    LOGIN: '/portal/auth/login/',
    LOGOUT: '/portal/auth/logout/',
    ME: '/portal/me/',
    UPLOAD_DOCUMENT: '/portal/me/upload-document/',
    ACCESS: '/portal/access/',
    NOTIFICATIONS: '/portal/notifications/',
  },

  RESOURCES: {
    LIST: '/resources/',
    DETAIL: (id: string) => `/resources/${id}/`,
  },

  MAGIC_LINKS: {
    LIST: '/magic-links/',
    DETAIL: (id: string) => `/magic-links/${id}/`,
    PUBLIC: (token: string) => `/magic-links/public/${token}/`,
    PUBLIC_UPLOAD: (token: string) => `/magic-links/public/${token}/upload/`,
  },

  REQUIREMENTS: {
    CHECK: '/requirements/check/',
  },
} as const;
