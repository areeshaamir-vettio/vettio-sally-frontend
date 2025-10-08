import { Job } from '@/services/jobs.service';

/**
 * Extract a display title from a job object
 * Since the new API doesn't have a dedicated title field, we extract it from raw_job_description
 */
export function getJobDisplayTitle(job: Job): string {
  if (!job.raw_job_description) {
    return 'Untitled Position';
  }

  // Try to extract the first line as title
  const firstLine = job.raw_job_description.split('\n')[0]?.trim();
  
  if (!firstLine) {
    return 'Untitled Position';
  }

  // If the first line is too long, truncate it
  if (firstLine.length > 60) {
    return firstLine.substring(0, 60) + '...';
  }

  return firstLine;
}

/**
 * Get a short description from the job description
 */
export function getJobShortDescription(job: Job, maxLength: number = 150): string {
  if (!job.raw_job_description) {
    return 'No description available';
  }

  // Skip the first line (title) and get the rest as description
  const lines = job.raw_job_description.split('\n');
  const descriptionLines = lines.slice(1).filter(line => line.trim());
  
  if (descriptionLines.length === 0) {
    return 'No description available';
  }

  const description = descriptionLines.join(' ').trim();
  
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + '...';
  }

  return description;
}

/**
 * Get status color class for UI display
 */
export function getStatusColorClass(status: Job['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get priority color class for UI display
 */
export function getPriorityColorClass(priority: Job['priority']): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format job statistics for display
 */
export function formatJobStats(job: Job): {
  applications: string;
  views: string;
  shortlisted: string;
  hired: string;
} {
  return {
    applications: job.application_count.toString(),
    views: job.view_count.toString(),
    shortlisted: job.shortlist_count.toString(),
    hired: job.hire_count.toString(),
  };
}

/**
 * Check if job is published
 */
export function isJobPublished(job: Job): boolean {
  return job.status === 'active' && !!job.published_at;
}

/**
 * Get relative time string for job creation/publication
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
