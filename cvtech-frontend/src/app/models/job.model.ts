export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  preferred_skills?: string[];
  experience_required: number;
  location: string;
  salary_range: string;
  job_type: string;
  posted_date: string;
  matchScore?: number;
}
