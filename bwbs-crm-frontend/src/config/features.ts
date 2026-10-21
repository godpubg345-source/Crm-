// ============================================================================
// FEATURE FLAGS — per-deployment module toggles
// Mirror of backend settings (ENABLE_IMMIGRATION_MODULE). Set
// VITE_ENABLE_IMMIGRATION=false to hide the Immigration Suite (visas +
// compliance) and sell the Education Consultancy ERP standalone.
// ============================================================================

/** Immigration Suite (visas + compliance) — separate product in /immigration/ */
export const ENABLE_IMMIGRATION = import.meta.env.VITE_ENABLE_IMMIGRATION !== 'false';
