export interface JobDescriptionUploadRequest {
  file: File;
  jobTitle?: string;
  companyId?: string;
}

export interface JobDescriptionUploadResponse {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  extractedText: string;
  jobTitle: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  location: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string;
  experienceLevel: string;
}

export interface JobDescriptionBuildRequest {
  jobTitle: string;
  companyId?: string;
  requirements?: string[];
  responsibilities?: string[];
}

export interface JobDescriptionBuildResponse {
  id: string;
  jobTitle: string;
  status: 'draft' | 'building' | 'complete';
  createdAt: string;
  buildProgress: number;
}
