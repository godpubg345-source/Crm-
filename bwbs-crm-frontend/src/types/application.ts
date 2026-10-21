// ============================================================================
// APPLICATION TYPES - Shared across portals
// ============================================================================

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ENROLLED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  student: string;
  student_details?: {
    id: string;
    full_name: string;
    email: string;
    student_code: string;
  };
  university?: string;
  university_name?: string;
  course?: string;
  course_name?: string;
  country_name?: string;
  status: ApplicationStatus;
  status_display?: string;
  assigned_to?: string;
  branch?: string;
  intake_date?: string;
  intake_month?: string;
  intake_year?: number;
  applied_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}


export interface ApplicationNote {
  id: string;
  application: string;
  note: string;
  created_by?: string;
  created_at: string;
}

export interface ApplicationChecklist {
  id: string;
  application: string;
  item_name: string;
  is_completed: boolean;
  completed_at?: string;
}
