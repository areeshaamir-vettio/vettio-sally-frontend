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

export interface Job {
  id: string;
  organization_id: string;
  status: 'draft' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high';
  tags: JobTag[];
  metadata: Record<string, any>;
  raw_job_description: string;
  jd_extraction_pending: boolean;
  jd_extracted_at: string | null;
  jd_extraction_error: string | null;
  searchable_content: SearchableContent;
  attachments: JobAttachment[];
  view_count: number;
  application_count: number;
  shortlist_count: number;
  hire_count: number;
  workflow_state: string;
  approval_status: string;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  sections: Record<string, any>;
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
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
        console.log('🔄 Got 401, attempting token refresh...');
        try {
          await AuthService.refreshToken();
          console.log('✅ Token refreshed, retrying listJobs...');
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
            signal: controller.signal,
          });
          const result = this.handleResponse<Job[]>(retryResponse);
          console.log('📊 Jobs fetched after retry:', (await result).length);
          return result;
        } catch (refreshError) {
          console.warn('⚠️ Token refresh failed during listJobs (this may be expected during login):', refreshError);
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
          console.log('🔄 Got 401 during hasJobs check, attempting token refresh...');
          try {
            await AuthService.refreshToken();
            console.log('✅ Token refreshed, retrying hasJobs...');
            const jobs = await this.listJobs({ limit: 50, clear_cache: true });
            const hasJobs = jobs.length > 0;
            console.log(`✅ User has ${jobs.length} jobs after retry (hasJobs: ${hasJobs})`);
            return hasJobs;
          } catch (refreshError) {
            console.warn('⚠️ Token refresh failed during hasJobs check (this is expected during login):', refreshError);
            console.log('ℹ️ Defaulting to hasJobs = false, user will be redirected to /get-started');
            return false;
          }
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
        console.log('🔄 Got 401, attempting token refresh...');
        try {
          await AuthService.refreshToken();
          console.log('✅ Token refreshed, retrying createJob...');
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(jobData),
          });
          return this.handleResponse<Job>(retryResponse);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
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
        console.log('🔄 Got 401, attempting token refresh...');
        try {
          await AuthService.refreshToken();
          console.log('✅ Token refreshed, retrying getJob...');
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
          });
          return this.handleResponse<Job>(retryResponse);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          throw new Error('Authentication failed');
        }
      }

      return this.handleResponse<Job>(response);
    } catch (error) {
      console.error('❌ Failed to fetch job:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const jobsService = new JobsService();
