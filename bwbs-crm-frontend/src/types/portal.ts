// ============================================================================
// PORTAL TYPES - Student/Parent portal specific
// ============================================================================

export interface PortalStudent {
  id: string;
  student_code: string;
  full_name: string;
  email: string;
  status: string;
  status_display: string;
  counselor_details?: {
    full_name: string;
    email: string;
    role_display: string;
    profile_photo?: string;
  } | null;
}

export interface PortalSessionResponse {
  session_token: string;
  expires_at: string;
  student: PortalStudent;
}

export interface PortalApplication {
  id: string;
  university_name: string;
  course_name: string;
  country_name?: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface PortalVisaCase {
  id: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface PortalDocument {
  id: string;
  file_name: string;
  file_size: number;
  file: string;
  status: string;
  status_display: string;
  document_type_display: string;
  is_verified: boolean;
  created_at: string;
}

export interface PortalPayment {
  id: string;
  amount: string;
  status: string;
  status_display: string;
  transaction_type_display: string;
  method_display: string;
  created_at: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  category: 'INFO' | 'ACTION' | 'PAYMENT' | 'DOCUMENT';
  read_at: string | null;
  created_at: string;
}

export interface PortalMeResponse {
  student: PortalStudent;
  applications: PortalApplication[];
  visa_cases: PortalVisaCase[];
  documents: PortalDocument[];
  payments: PortalPayment[];
  notifications: PortalNotification[];
}
