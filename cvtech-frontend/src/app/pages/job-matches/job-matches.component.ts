import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { ActivatedRoute } from '@angular/router';
import { Job } from '../../models/job.model';
import { JobMatch } from '../../models/job-match.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-matches.component.html',
  styleUrls: ['./job-matches.component.css']
})
export class JobMatchesComponent implements OnInit {
  jobs: Job[] = [];
  matchedJobs: JobMatch[] = [];
  loading = true;
  error: string | null = null;
  resumeId: string | null = null;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.resumeId = params['resumeId'];
      this.loadJobs();
    });
  }

  loadJobs(): void {
    console.log('Loading jobs...');
    this.loading = true;
    this.error = null;
    
    this.jobService.getAllJobs().subscribe({
      next: (response) => {
        console.log('Jobs received:', response);
        // Transform the API response to match our Job interface
        this.jobs = (response.jobs || []).map(job => this.transformJob(job));
        this.loading = false;
        
        // Load matches if resumeId exists
        if (this.resumeId) {
          this.loadMatches();
        }
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
        this.loading = false;
      }
    });
  }

  // Add this transformation method
  private transformJob(job: any): Job {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      required_skills: job.requiredSkillsList || [],
      preferred_skills: job.preferredSkillsList || [],
      experience_required: job.experienceRequired || 0,
      location: job.location,
      salary_range: job.salaryRange, // Map from API's salaryRange to our salary_range
      job_type: job.jobType,        // Map from API's jobType to our job_type
      posted_date: job.postedDate   // Map from API's postedDate to our posted_date
    };
  }

  loadMatches(): void {
    this.jobService.getMatchedJobs(this.resumeId!).subscribe({
      next: (matches) => {
        this.matchedJobs = matches;
        this.highlightMatches();
      },
      error: (err) => {
        console.error('Error loading matches:', err);
        // Continue showing jobs without match scores
      }
    });
  }

  highlightMatches(): void {
    if (!this.matchedJobs.length) return;
    
    this.jobs = this.jobs.map(job => {
      const match = this.matchedJobs.find(m => m.job_id === job.id);
      return {
        ...job,
        matchScore: match ? match.match_score : undefined
      };
    });

    // Sort jobs by match score (highest first)
    this.jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  getMatchColor(score: number | undefined): string {
    if (score === undefined) return '';
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}