// ============================================================================
// STUDENT TYPES - Shared across all portals
// ============================================================================

import { type Application } from './application';

export interface Student {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  status: string;
  status_display?: string;
  interested_program?: string;
  education_history?: {
    summary: string;
    details?: any[];
  };
  english_test_type?: string;
  english_test_score?: string;
  financial_status?: string;
  profile_completeness?: number;
  branch?: string;
  assigned_to?: string;
  documents?: Document[];
  applications?: Application[];
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  student: string;
  file_name: string;
  file: string;
  file_size?: number;
  document_type?: string;
  document_type_display?: string;
  status: string;
  status_display?: string;
  is_verified: boolean;
  expiry_date?: string;
  uploaded_at: string;
  created_at: string;
}


export interface DocumentAlert {
  id: string;
  document: string;
  alert_type: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}
