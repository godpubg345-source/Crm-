import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Portal lazy imports
const AdminPortal   = lazy(() => import('./portals/admin/AdminApp'));
const EmployeePortal = lazy(() => import('./portals/employee/EmployeeApp'));
const StudentPortal  = lazy(() => import('./portals/student/StudentApp'));
const CeoPortal      = lazy(() => import('./portals/ceo/CeoApp'));
const PublicPages    = lazy(() => import('./portals/public/PublicApp'));

// Auth pages
const Login      = lazy(() => import('./portals/public/Login'));
const EmpLogin   = lazy(() => import('./portals/public/EmpLogin'));
const PortalLogin = lazy(() => import('./portals/public/PortalLogin'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Branded loading fallback
const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#050810]">
    <div className="flex flex-col items-center gap-5">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#AD03DE] to-indigo-600 animate-pulse shadow-[0_0_60px_rgba(173,3,222,0.4)]" />
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] animate-pulse">
        Initializing Portal Space...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* ── Auth Routes ────────────────────────────────── */}
            <Route path="/login"                  element={<Login />} />
            <Route path="/employee-portal/login"  element={<EmpLogin />} />
            <Route path="/portal/login"           element={<PortalLogin />} />

            {/* ── Secure Portals ─────────────────────────────── */}
            <Route path="/admin/*"           element={<AdminPortal />} />
            <Route path="/ceo/*"             element={<CeoPortal />} />
            <Route path="/employee-portal/*" element={<EmployeePortal />} />
            <Route path="/portal/*"          element={<StudentPortal />} />

            {/* ── Public / Fallback ──────────────────────────── */}
            <Route path="/*"                 element={<PublicPages />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
