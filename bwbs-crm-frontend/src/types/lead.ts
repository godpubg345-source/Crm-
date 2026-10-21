// ============================================================================
// LEAD TYPES - Shared across all portals
// ============================================================================

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'ENROLLED'
  | 'LOST'
  | 'ARCHIVED';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  status_display?: string;
  assigned_to?: string;
  assigned_to_details?: {
    id: string;
    full_name: string;
    email: string;
  };
  branch?: string;
  branch_details?: {
    id: string;
    name: string;
    code: string;
  };
  nationality?: string;
  interested_country?: string;
  interested_course?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeadInteraction {
  id: string;
  lead: string;
  interaction_type: string;
  notes: string;
  created_by?: string;
  created_at: string;
}
