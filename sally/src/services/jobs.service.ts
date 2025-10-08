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
    // Check if we're using mock tokens (for development/testing)
    const token = AuthService.getAccessToken();
    if (token && token.startsWith('mock.')) {
      console.log('🎭 Mock token detected, returning mock jobs list');

      // For testing purposes, you can return mock jobs or empty array
      // Currently returning empty array to test the "no jobs" flow
      // Uncomment the lines below to test with mock jobs:

      /*
      const mockJobs: Job[] = [
        {
          id: 'mock-job-1',
          organization_id: 'mock-org-1',
          status: 'draft',
          priority: 'high',
          tags: [
            { name: 'Frontend', category: 'skill', color: '#3B82F6' },
            { name: 'React', category: 'technology', color: '#10B981' }
          ],
          metadata: {},
          raw_job_description: 'Senior Frontend Developer\nWe are looking for an experienced React developer...',
          jd_extraction_pending: false,
          jd_extracted_at: new Date().toISOString(),
          jd_extraction_error: null,
          searchable_content: {
            content: 'Senior Frontend Developer React JavaScript',
            keywords: ['React', 'JavaScript', 'Frontend'],
            language: 'en',
            embedding_vector: []
          },
          attachments: [],
          view_count: 15,
          application_count: 3,
          shortlist_count: 1,
          hire_count: 0,
          workflow_state: 'review',
          approval_status: 'pending',
          published_at: null,
          closed_at: null,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date().toISOString(),
          created_by: 'mock-user-1',
          updated_by: null,
          sections: {}
        }
      ];
      return mockJobs;
      */

      return [];
    }

    const params = new URLSearchParams();

    if (options.status_filter) params.append('status_filter', options.status_filter);
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    if (options.offset !== undefined) params.append('offset', options.offset.toString());
    if (options.clear_cache) params.append('clear_cache', 'true');

    const url = `${this.baseURL}${API_ENDPOINTS.INTAKE.LIST}${params.toString() ? `?${params}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Job[]>(response);
  }

  /**
   * Check if the user has any jobs
   * @returns Promise<boolean> True if user has jobs, false otherwise
   */
  async hasJobs(): Promise<boolean> {
    try {
      // Check if we're using mock tokens (for development/testing)
      const token = AuthService.getAccessToken();
      if (token && token.startsWith('mock.')) {
        console.log('🎭 Mock token detected, returning mock job status');
        // For mock login, simulate having no jobs to test the get-started flow
        return false;
      }

      const jobs = await this.listJobs({ limit: 1 });
      return jobs.length > 0;
    } catch (error) {
      console.error('Failed to check if user has jobs:', error);
      // In case of error, assume they don't have jobs and redirect to get-started
      return false;
    }
  }

  /**
   * Get a specific job by ID
   * @param id - Job ID
   * @returns Promise<Job> Job details
   */
  async getJob(id: string): Promise<Job> {
    const response = await fetch(`${this.baseURL}${API_ENDPOINTS.INTAKE.GET(id)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Job>(response);
  }
}

// Export a singleton instance
export const jobsService = new JobsService();
