export interface CreateRoleRequest {
  title?: string;
  location_text?: string;
  raw_job_description?: string;
}

export interface Role {
  id: string;
  title?: string;
  location_text?: string;
  raw_job_description?: string;
  status: string; // e.g. "draft"
  organization_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Additional fields that might be returned
  department?: string;
  seniority_level?: string;
  contract_type?: string;
  priority?: string;
  view_count?: number;
  application_count?: number;
  overall_completion?: number;
}
