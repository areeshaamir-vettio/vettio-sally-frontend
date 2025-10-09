// Types for Role Candidates API Integration

export interface CandidatePersonalInfo {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  preferred_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  work_authorization?: string | null;
  profile_picture_url?: string | null;
}

export interface CandidateContactInfo {
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  linkedin_profile_id?: string | null;
  website?: string | null;
}

export interface CandidateProfessionalInfo {
  current_title?: string | null;
  current_company?: string | null;
  industry?: string | null;
  seniority_level?: string | null;
  years_experience?: number | null;
  current_salary?: number | null;
  expected_salary?: number | null;
  notice_period?: string | null;
  availability_date?: string | null;
  remote_preference?: string | null;
  willing_to_relocate?: boolean;
}

export interface CandidateSkill {
  name: string;
  category: string;
  proficiency_level: string;
  years_experience?: number | null;
  is_required: boolean;
  weight: number;
}

export interface CandidateSourceAttribution {
  source_type: string;
  source_name?: string | null;
  source_url?: string | null;
  referrer_id?: string | null;
  campaign_id?: string | null;
  role_id: string;
  discovered_by_user_id: string;
  discovered_at: string;
  discovery_method: string;
  raw_source_data?: any;
}

export interface CandidateAuditInfo {
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  version: number;
}

export interface Candidate {
  id: string;
  organization_id: string;
  personal_info?: CandidatePersonalInfo;
  contact_info?: CandidateContactInfo;
  professional_info?: CandidateProfessionalInfo;
  skills?: CandidateSkill[];
  source_attribution?: CandidateSourceAttribution;
  audit_info?: CandidateAuditInfo;
  status: string;
  linkedin_profile_id?: string;
  linkedin_url?: string;
  discovered_at: string;
  discovered_by_user_id?: string;
  raw_source_data_size?: number;

  // Additional fields from API
  address?: any;
  work_experience?: any;
  education?: any;
  certifications?: any;
  languages?: any;
  consent_records?: any;
  privacy_preferences?: any;
  summary?: any;
  notes?: any;
  tags?: any;
  metadata?: any;
  interaction_history?: any;
  calibration_feedback?: any;
  interview_results?: any;
  rubric_alignments?: any;
  searchable_content?: any;
  attachments?: any;
  view_count?: number;
  contact_attempts?: number;
  response_rate?: number;
  timezone?: any;
  last_activity?: any;
}

export interface RoleCandidatesMetadata {
  query_timestamp: string;
  user_id: string;
  organization_id: string;
  limit_applied: number;
  has_more: boolean;
}

export interface RoleCandidatesResponse {
  role_id: string;
  candidates: Candidate[];
  total_count: number;
  metadata: RoleCandidatesMetadata;
}

export interface RoleCandidatesOptions {
  limit?: number;
}

// Error response types
export interface CandidatesApiError {
  detail: string;
}

// Status types for candidate filtering
export type CandidateStatus = 'new' | 'shortlisted' | 'rejected' | 'all';

// Extended candidate interface for UI components
export interface CandidateWithStatus extends Candidate {
  status?: CandidateStatus;
}
