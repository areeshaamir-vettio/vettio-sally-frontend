'use client';

import { API_CONFIG, API_ENDPOINTS } from '@/lib/constants';
import { AuthService } from '@/lib/auth';

export interface JobsListOptions {
  status_filter?: 'draft' | 'active' | 'closed';
  limit?: number;
  offset?: number;
  clear_cache?: boolean;
}

export interface JobTag {
  name: string;
  category: string;
  color: string;
}

export interface SearchableContent {
  content: string;
  keywords: string[];
  language: string;
  embedding_vector: number[];
}

export interface JobAttachment {
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}

// Interface for the intake API response
export interface IntakeRoleResponse {
  role: {
    basic_information: {
      location_text?: string;
      title?: string;
    };
    role_purpose: {
      job_description?: string;
    };
    key_responsibilities: Record<string, any>;
    skills_qualifications: Record<string, any>;
    role_context: Record<string, any>;
    performance_kpis: Record<string, any>;
    compensation_benefits: Record<string, any>;
    culture_value_fit: Record<string, any>;
    hiring_practicalities: Record<string, any>;
    approval_notes: Record<string, any>;
    basic_information_complete: boolean;
    role_purpose_complete: boolean;
    key_responsibilities_complete: boolean;
    skills_qualifications_complete: boolean;
    role_context_complete: boolean;
    performance_kpis_complete: boolean;
    compensation_benefits_complete: boolean;
    culture_value_fit_complete: boolean;
    hiring_practicalities_complete: boolean;
    approval_notes_complete: boolean;
    completed_sections: string[];
    current_section: string;
    remaining_sections: string[];
  };
  conversation: Record<string, any>;
  next_question: any;
  completeness_score: number;
  is_complete: boolean;
}

export interface Job {
  id: string;
  organization_id: string;
  status: 'draft' | 'active' | 'closed';
  title: string;
  department: string | null;
  seniority_level: string | null;
  contract_type: string;
  priority: 'low' | 'medium' | 'high';
  company_context: any;
  role_requirements: any;
  locations: any;
  compensation: any;
  job_description: string | null;
  evaluation_rubric: any;
  hiring_process: any;
  disqualifiers: any;
  nice_to_have: any;
  raw_job_description: string | null;
  jd_extraction_pending: boolean;
  jd_extracted_at: string | null;
  jd_extraction_error: string | null;
  location_text: string;
  sections: {
    basic_information: {
      location_text?: string;
      title?: string;
    };
    role_purpose: {
      job_description?: string;
    };
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  created_by: string | null;
  view_count: number;
  application_count: number;
  shortlist_count: number;
  workflow_state: string | null;
  approval_status: string | null;
}

export class JobsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const token = AuthService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔍 JobsService: Error response data:', errorData);

      // Check for specific pending approval error - check both message and detail fields
      if (response.status === 403) {
        const errorMessage = errorData.message || errorData.detail || '';
        console.log('⏳ JobsService: Got 403 error - treating as pending approval (will be handled by caller):', errorMessage);

        // Create a special error that indicates pending approval but won't show in console
        const pendingError = new Error('PENDING_APPROVAL_REDIRECT');
        (pendingError as any).isPendingApproval = true;
        (pendingError as any).shouldRedirect = true;
        throw pendingError;
      }

      throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List roles/jobs with optional filtering and pagination
   * @param options - Query options for filtering and pagination
   * @returns Promise<Job[]> List of jobs
   */
  async listJobs(options: JobsListOptions = {}): Promise<Job[]> {
    const params = new URLSearchParams();

    if (options.status_filter) params.append('status_filter', options.status_filter);
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    if (options.offset !== undefined) params.append('offset', options.offset.toString());
    if (options.clear_cache) params.append('clear_cache', 'true');

    const url = `${this.baseURL}${API_ENDPOINTS.INTAKE.LIST}${params.toString() ? `?${params}` : ''}`;

    console.log('🌐 Making API call to:', url);
    console.log('🔑 Headers:', this.getHeaders());
    console.log('📝 Options:', options);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('🔄 JobsService: Got 401, attempting token refresh...');
        try {
          // Import TokenManager to check refresh token validity
          const { TokenManager } = await import('@/lib/auth');
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
            console.error('❌ JobsService: Refresh token missing or expired');
            AuthService.performFullLogout();
            throw new Error('Session expired');
          }

          await AuthService.refreshToken();
          console.log('✅ JobsService: Token refreshed, waiting for session to be ready...');

          // Add a delay to ensure backend session is fully established
          await new Promise(resolve => setTimeout(resolve, 250));
          console.log('✅ JobsService: Session ready, retrying listJobs...');

          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
            signal: controller.signal,
          });

          // If we still get 401 after token refresh, try one more time with additional delay
          if (retryResponse.status === 401) {
            console.log('⚠️ JobsService: Still getting 401 after token refresh, trying once more...');
            await new Promise(resolve => setTimeout(resolve, 300));

            const finalRetryResponse = await fetch(url, {
              method: 'GET',
              headers: this.getHeaders(),
              signal: controller.signal,
            });

            const finalResult = this.handleResponse<Job[]>(finalRetryResponse);
            console.log('📊 Jobs fetched after final retry:', (await finalResult).length);
            return finalResult;
          }

          const result = this.handleResponse<Job[]>(retryResponse);
          console.log('📊 Jobs fetched after retry:', (await result).length);
          return result;
        } catch (refreshError: any) {
          console.warn('⚠️ JobsService: Token refresh failed during listJobs:', refreshError);

          // Only call performFullLogout if it wasn't already called
          if (!refreshError?.message?.includes('Session expired') &&
              !refreshError?.message?.includes('Refresh token expired')) {
            AuthService.performFullLogout();
          }

          throw new Error('Authentication failed');
        }
      }

      const result = await this.handleResponse<Job[]>(response);
      console.log('📊 Jobs fetched successfully:', result.length);
      console.log('📋 First 5 job titles:', result.slice(0, 5).map(job => job.sections?.basic_information?.title || 'Untitled'));
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      // Log as warning instead of error if it's an auth issue during login
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        console.warn('⚠️ listJobs authentication error (may be expected during login):', error.message);
      } else {
        console.error('❌ listJobs error:', error);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - API call took too long');
      }
      throw error;
    }
  }

  /**
   * Check if the user has any jobs
   * @returns Promise<boolean> True if user has jobs, false otherwise
   */
  async hasJobs(): Promise<boolean> {
    try {
      const token = AuthService.getAccessToken();

      if (!token) {
        console.log('⚠️ No authentication token found');
        return false;
      }

      console.log('🔍 Checking if user has jobs...');

      try {
        const jobs = await this.listJobs({ limit: 50, clear_cache: true });
        const hasJobs = jobs.length > 0;
        console.log(`✅ User has ${jobs.length} jobs (hasJobs: ${hasJobs})`);
        return hasJobs;
      } catch (apiError) {
        // If we get a 401, try to refresh the token once
        if (apiError instanceof Error && apiError.message.includes('401')) {
          console.log('🔄 JobsService: Got 401 during hasJobs check, attempting token refresh...');
          try {
            // Import TokenManager to check refresh token validity
            const { TokenManager } = await import('@/lib/auth');
            const refreshToken = TokenManager.getRefreshToken();

            if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
              console.error('❌ JobsService: Refresh token missing or expired during hasJobs');
              AuthService.performFullLogout();
              return false;
            }

            await AuthService.refreshToken();
            console.log('✅ JobsService: Token refreshed, waiting for session to be ready...');

            // Add a delay to ensure backend session is fully established
            await new Promise(resolve => setTimeout(resolve, 250));
            console.log('✅ JobsService: Session ready, retrying hasJobs...');

            const jobs = await this.listJobs({ limit: 50, clear_cache: true });
            const hasJobs = jobs.length > 0;
            console.log(`✅ User has ${jobs.length} jobs after retry (hasJobs: ${hasJobs})`);
            return hasJobs;
          } catch (refreshError: any) {
            console.warn('⚠️ JobsService: Token refresh failed during hasJobs check:', refreshError);
            console.log('ℹ️ Defaulting to hasJobs = false, user will be redirected to /get-started');
            return false;
          }
        }

        // Check if this is a pending approval error
        if (apiError instanceof Error && (
          apiError.message.includes('PENDING_APPROVAL_REDIRECT') ||
          apiError.message.includes('Account pending approval') ||
          apiError.message.includes('pending approval') ||
          apiError.message.includes('pending admin approval') ||
          (apiError as any).isPendingApproval === true
        )) {
          console.log('⏳ JobsService: Account pending approval detected during hasJobs check - re-throwing for caller to handle');

          // Re-throw the special error so the caller can handle the redirect
          throw apiError;
        }

        // For other errors, log and return false
        console.warn('⚠️ Error checking jobs (defaulting to false):', apiError);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to check if user has jobs (defaulting to false):', error);
      // In case of error, assume they don't have jobs and redirect to get-started
      return false;
    }
  }

  /**
   * Create a new job/role
   * @param jobData - Job creation data
   * @returns Promise<Job> Created job details
   */
  async createJob(jobData: {
    title?: string;
    location?: string;
    job_description?: string;
  }): Promise<Job> {
    const url = `${this.baseURL}${API_ENDPOINTS.INTAKE.CREATE}`;

    console.log('🌐 Making API call to:', url);
    console.log('📝 Job data:', jobData);
    console.log('🔑 Headers:', this.getHeaders());

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(jobData),
      });

      // If we get a 401, try to refresh the token once
      if (response.status === 401) {
        console.log('🔄 JobsService: Got 401, attempting token refresh...');
        try {
          // Import TokenManager to check refresh token validity
          const { TokenManager } = await import('@/lib/auth');
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
            console.error('❌ JobsService: Refresh token missing or expired during createJob');
            AuthService.performFullLogout();
            throw new Error('Session expired');
          }

          await AuthService.refreshToken();
          console.log('✅ JobsService: Token refreshed, retrying createJob...');
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(jobData),
          });
          return this.handleResponse<Job>(retryResponse);
        } catch (refreshError: any) {
          console.error('❌ JobsService: Token refresh failed during createJob:', refreshError);

          // Only call performFullLogout if it wasn't already called
          if (!refreshError?.message?.includes('Session expired') &&
              !refreshError?.message?.includes('Refresh token expired')) {
            AuthService.performFullLogout();
          }

          throw new Error('Authentication failed');
        }
      }

      return this.handleResponse<Job>(response);
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    }
  }

  /**
   * Get a specific job by ID
   * @param id - Job ID
   * @returns Promise<Job> Job details
   */
  async getJob(id: string): Promise<Job> {
    // Check if we have a valid auth token before making the request
    const token = AuthService.getAccessToken();
    if (!token) {
      console.log('⏭️ JobsService.getJob: No auth token available, skipping API call');
      throw new Error('Authentication required');
    }

    const url = `${this.baseURL}${API_ENDPOINTS.INTAKE.GET(id)}`;

    console.log('🌐 Making API call to:', url);
    console.log('🔑 Headers:', this.getHeaders());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // If we get a 401, try to refresh the token once
      if (response.status === 401) {
        console.log('🔄 JobsService: Got 401, attempting token refresh...');
        try {
          // Import TokenManager to check refresh token validity
          const { TokenManager } = await import('@/lib/auth');
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
            console.error('❌ JobsService: Refresh token missing or expired during getJob');
            AuthService.performFullLogout();
            throw new Error('Session expired');
          }

          await AuthService.refreshToken();
          console.log('✅ JobsService: Token refreshed, retrying getJob...');
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
          });
          return this.handleResponse<Job>(retryResponse);
        } catch (refreshError: any) {
          console.error('❌ JobsService: Token refresh failed during getJob:', refreshError);

          // Only call performFullLogout if it wasn't already called
          if (!refreshError?.message?.includes('Session expired') &&
              !refreshError?.message?.includes('Refresh token expired')) {
            AuthService.performFullLogout();
          }

          throw new Error('Authentication failed');
        }
      }

      const intakeResponse = await this.handleResponse<IntakeRoleResponse>(response);
      console.log('🔍 JobsService.getJob - Raw intake response:', intakeResponse);
      console.log('🔍 JobsService.getJob - Role data:', intakeResponse.role);
      console.log('🔍 JobsService.getJob - Basic information:', intakeResponse.role?.basic_information);
      console.log('🔍 JobsService.getJob - Job title:', intakeResponse.role?.basic_information?.title);

      return this.transformIntakeResponseToJob(id, intakeResponse);
    } catch (error) {
      console.error('❌ Failed to fetch job:', error);
      throw error;
    }
  }

  /**
   * Transform intake API response to Job interface
   */
  private transformIntakeResponseToJob(id: string, intakeResponse: IntakeRoleResponse): Job {
    return {
      id,
      organization_id: '', // Will be set by backend based on user's organization
      status: 'draft', // Default status
      title: intakeResponse.role?.basic_information?.title || '',
      department: null,
      seniority_level: null,
      contract_type: 'full_time',
      priority: 'medium',
      company_context: null,
      role_requirements: null,
      locations: null,
      compensation: null,
      job_description: intakeResponse.role?.role_purpose?.job_description || null,
      evaluation_rubric: null,
      hiring_process: null,
      disqualifiers: null,
      nice_to_have: null,
      raw_job_description: null,
      jd_extraction_pending: false,
      jd_extracted_at: null,
      jd_extraction_error: null,
      location_text: intakeResponse.role?.basic_information?.location_text || '',
      sections: intakeResponse.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      view_count: 0,
      application_count: 0,
      shortlist_count: 0,
      workflow_state: null,
      approval_status: null
    };
  }
}

// Export a singleton instance
export const jobsService = new JobsService();
