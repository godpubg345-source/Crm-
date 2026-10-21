# Student Portal Technical Design

## 1. Technical Architecture & Data Isolation

The Student Portal is built as a highly isolated, "Public-Facing" extension of the Education Consultancy ERP. While the ERP is used by staff, the Portal is a dedicated interface for students (and parents).

### Multi-Tenant Context
The portal will leverage the existing `TenantAwareModel` logic. 
- **Data Isolation**: Every `PortalAccess` record is linked to a `Student`, which in turn is linked to a `Branch`.
- **Global Constraints**: Students can only see data belonging to their own record across all modules (`applications`, `visas`, `finance`).

### Authentication & Authorization
- **Token Mechanism**: Uses the existing `PortalSession` model with a `UUID` based session token.
- **CSRF & Security**: Tokens are passed via the `Authorization: Bearer <token>` header.
- **Role**: A specific `PortalPermission` class (already partially implemented in `accounts/permissions.py`) will restrict access to Portal-specific views only.

### Backend App: `portal`
The existing `portal` app will be the central hub.
- `PortalMeView`: The primary context endpoint that returns the "Command Center" state (student info, recent applications, visa status, notifications).
- `PortalUploadDocumentView`: Handles secure uploads directly into the student's document vault.

## 2. Frontend Architecture: The "Public" Layer

The Student Portal frontend will reside within the existing React/Vite codebase but will be physically and logically separated from the staff dashboard.

### Routing & Public Workspace
- **Namespace**: All portal routes will start with `/portal/*`.
- **Portal Layout**: A new `PortalLayout.tsx` will replace the `DashboardLayout.tsx` for these routes, providing a simpler, more student-centric navigation.
- **Authentication Guard**: A `PortalAuthGuard.tsx` will check for the `portal_session_token` in `localStorage`.

### Core Components
- `PortalDashboard`: The main "Command Center" view.
- `PortalApplications`: Detailed timeline of university applications.
- `PortalDocuments`: Document vault for viewing and uploading files.
- `PortalNotifications`: Full feed of updates and alerts.

## 3. Data Flow: The "Live" Experience

To ensure the portal feels alive, we will use **TanStack Query** for real-time data sync.

1.  **Hydration**: On load, `PortalMeView` hydrations the entire dashboard state.
2.  **Optimistic Updates**: When a student uploads a document, it appears instantly in the "Vault" before the server responds.
3.  **Polling/Websockets**: (Optional Phase 2) Background polling for notification updates.

## 4. Implementation Roadmap

We will build the Student Portal in three distinct phases to ensure stability and high polish.

### Phase 1: Foundation & Identity (The "Entry")
- **Backend**: Finalize `PortalAccess` and `PortalSession` endpoints. Implement `PortalPermission`.
- **Frontend**: Create `PortalLayout` and `PortalLogin` (Invite-only flow).
- **Security**: Implement the `PortalAuthGuard`.

### Phase 2: The Command Center (The "Feed")
- **Backend**: Implement the `PortalMeView` aggregator.
- **Frontend**: Build the `PortalDashboard` with the "Visual Journey" tracker and recent activity feed.

### Phase 3: Interactive Module (The "Utility")
- **Frontend**: Implement `PortalDocuments` (Vault with upload capability) and `PortalApplications` (Detailed timelines).
- **Polish**: Add micro-animations to the journey tracker and global theme refinement.

---

## 5. Success Criteria
- [ ] Students can log in using a valid invite token.
- [ ] Students can see a real-time journey tracker of their application.
- [ ] Students can securely upload documents.
- [/] **Zero data leakage**: Students MUST NOT be able to access any staff-only views or other students' data.

---
*Technical Design finalized by Antigravity AI • Feb 2026*
