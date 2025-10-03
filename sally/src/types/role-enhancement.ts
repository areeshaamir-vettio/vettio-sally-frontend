// Types for Role Enhancement API Integration

// ============================================================================
// ROLE SECTION TYPES
// ============================================================================

export interface RoleSectionBase {
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
}

export interface BasicInformation extends RoleSectionBase {
  title: string | null;
  department: string | null;
  seniority_level: string | null;
  contract_type: string | null;
  location_text: string | null;
  remote_work_policy: string | null;
}

export interface RolePurpose extends RoleSectionBase {
  role_mission: string | null;
  business_impact: string | null;
  strategic_importance: string | null;
  role_objectives: string[] | null;
  job_description: string | null;
}

export interface KeyResponsibilities extends RoleSectionBase {
  responsibilities: string[] | null;
  key_outcomes: string[] | null;
}

export interface SkillsQualifications extends RoleSectionBase {
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  specific_technologies: string[] | null;
  years_experience: string | null;
  education_requirements: string | null;
  qualifications: string[] | null;
}

export interface RoleContext extends RoleSectionBase {
  team_size: string | null;
  reporting_to: string | null;
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  tech_stack: string[] | null;
  work_environment: string | null;
  organizational_structure: string | null;
}

export interface PerformanceKPIs extends RoleSectionBase {
  success_metrics: string[] | null;
  performance_expectations: string | null;
  success_timeline: string | null;
}

export interface CompensationBenefits extends RoleSectionBase {
  compensation_hints: string | null;
  benefits_package: string[] | null;
  perks_and_benefits: Record<string, unknown> | null;
  equity_details: string | null;
  bonus_structure: string | null;
}

export interface CultureValueFit extends RoleSectionBase {
  culture_values: string[] | null;
  role_culture_fit: string[] | null;
  working_style_preferences: string | null;
  collaboration_requirements: string | null;
  communication_style: string | null;
  team_dynamics: string | null;
}

export interface HiringPracticalities extends RoleSectionBase {
  urgency_level: string | null;
  preferred_start_date: string | null;
  hiring_timeline: string | null;
  budget_approval_status: string | null;
  headcount_justification: string | null;
}

export interface ApprovalNotes extends RoleSectionBase {
  workflow_state: string | null;
  approval_status: string | null;
  metadata: Record<string, unknown>;
  disqualifiers: string[] | null;
}

// ============================================================================
// ROLE DATA TYPE
// ============================================================================

export interface RoleData {
  basic_information: BasicInformation;
  role_purpose: RolePurpose;
  key_responsibilities: KeyResponsibilities;
  skills_qualifications: SkillsQualifications;
  role_context: RoleContext;
  performance_kpis: PerformanceKPIs;
  compensation_benefits: CompensationBenefits;
  culture_value_fit: CultureValueFit;
  hiring_practicalities: HiringPracticalities;
  approval_notes: ApprovalNotes;
  overall_completion: number;
  current_section: string;
  sections_summary: Record<string, boolean>;
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    completeness_at_greeting?: number;
    is_greeting?: boolean;
    target_field?: string;
    field_section?: string;
    [key: string]: unknown;
  };
}

export interface ConversationMetadata {
  completion_status: number;
  extracted_data: {
    role_id: string;
    [key: string]: unknown;
  };
  next_questions: string[];
  confidence_scores: Record<string, unknown>;
  tags: string[];
  priority: string;
  field_attempts: Record<string, unknown>;
  skipped_fields: string[];
  last_target_field: string | null;
}

export interface AuditInfo {
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  version: number;
}

export interface ConversationData {
  id: string | null;
  organization_id: string;
  status: 'active' | 'paused' | 'completed';
  tags: string[] | null;
  metadata: ConversationMetadata;
  audit_info: AuditInfo;
  session_id: string;
  user_id: string;
  messages: ConversationMessage[];
  created_at: string;
  last_activity: string;
  context_data: {
    role_id: string;
    [key: string]: unknown;
  };
  conversation_type: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface RoleEnhancementResponse {
  role: RoleData;
  conversation: ConversationData;
  next_question: string;
  completeness_score: number;
  is_complete: boolean;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface SendMessageRequest {
  user_message: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationError {
  detail: ValidationErrorDetail[];
}

export interface ApiError {
  message: string;
  status: number;
  details?: ValidationError | Record<string, unknown>;
}

// ============================================================================
// SECTION METADATA (for mapping)
// ============================================================================

export const SECTION_METADATA = {
  basic_information: {
    title: 'Basic Information',
    description: 'Job title, department, and basic details',
    stepNumber: 1,
  },
  role_purpose: {
    title: 'Role Purpose & Objectives',
    description: 'Define the main purpose and objectives of the role',
    stepNumber: 2,
  },
  key_responsibilities: {
    title: 'Key Responsibilities',
    description: 'List the main responsibilities and duties',
    stepNumber: 3,
  },
  skills_qualifications: {
    title: 'Skills & Qualifications',
    description: 'Required and preferred qualifications',
    stepNumber: 4,
  },
  role_context: {
    title: 'Role Context',
    description: 'Team structure and reporting relationships',
    stepNumber: 5,
  },
  performance_kpis: {
    title: 'Performance & KPIs',
    description: 'Key performance indicators and success metrics',
    stepNumber: 6,
  },
  compensation_benefits: {
    title: 'Compensation & Benefits',
    description: 'Salary range and benefits package',
    stepNumber: 7,
  },
  culture_value_fit: {
    title: 'Culture and Value Fit',
    description: 'Company culture and values alignment',
    stepNumber: 8,
  },
  hiring_practicalities: {
    title: 'Hiring Practicalities',
    description: 'Timeline, process, and logistics',
    stepNumber: 9,
  },
  approval_notes: {
    title: 'Approval & Notes',
    description: 'Final review and approval process',
    stepNumber: 10,
  },
} as const;

export type SectionKey = keyof typeof SECTION_METADATA;

