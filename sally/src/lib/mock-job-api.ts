import { 
  JobDescriptionUploadRequest, 
  JobDescriptionUploadResponse,
  JobDescriptionBuildRequest,
  JobDescriptionBuildResponse 
} from '@/types/job-description';

// Mock API client for job description functionality
export const mockJobDescriptionApi = {
  async uploadJobDescription(data: JobDescriptionUploadRequest): Promise<JobDescriptionUploadResponse> {
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful upload response
    return {
      id: `job_desc_${Date.now()}`,
      filename: data.file.name,
      size: data.file.size,
      uploadedAt: new Date().toISOString(),
      extractedText: "We are looking for a skilled Software Engineer to join our dynamic team...",
      jobTitle: data.jobTitle || "Software Engineer",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "3+ years of experience in software development",
        "Proficiency in JavaScript, TypeScript, and React",
        "Experience with Node.js and databases"
      ],
      responsibilities: [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
        "Participate in code reviews"
      ],
      qualifications: [
        "Strong problem-solving skills",
        "Excellent communication abilities",
        "Experience with agile methodologies",
        "Knowledge of cloud platforms (AWS, Azure, GCP)"
      ],
      benefits: [
        "Competitive salary",
        "Health insurance",
        "401(k) matching",
        "Flexible work arrangements"
      ],
      location: "San Francisco, CA",
      salaryRange: {
        min: 80000,
        max: 120000,
        currency: "USD"
      },
      employmentType: "Full-time",
      experienceLevel: "Mid-level"
    };
  },

  async buildJobDescription(data: JobDescriptionBuildRequest): Promise<JobDescriptionBuildResponse> {
    // Simulate AI building delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: `job_build_${Date.now()}`,
      jobTitle: data.jobTitle,
      status: 'building',
      createdAt: new Date().toISOString(),
      buildProgress: 0
    };
  }
};
