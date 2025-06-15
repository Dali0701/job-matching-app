import { Component, OnInit } from '@angular/core';
import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service';
import { AdminJobService } from '../../services/admin-job.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-job-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-job-management.component.html',
  styleUrls: ['./admin-job-management.component.css']
})
export class AdminJobManagementComponent implements OnInit {
  jobs: Job[] = [];
  currentJob: Job = this.createEmptyJob();
  isEditing = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  newSkill: string = '';

  constructor(
    private jobService: JobService,
    private adminJobService: AdminJobService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getAllJobs().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.jobs = (response.jobs || []).map(job => this.transformJob(job));
      },
      error: (err) => {
        this.errorMessage = 'Failed to load jobs. Please try again later.';
        console.error('Error loading jobs:', err);
      }
    });
  }

  private transformJob(job: any): Job {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      required_skills: this.parseSkills(job.requiredSkills),
      preferred_skills: this.parseSkills(job.preferredSkills),
      experience_required: job.experienceRequired || 0,
      location: job.location,
      salary_range: job.salaryRange,
      job_type: job.jobType,
      posted_date: job.postedDate
    };
  }

  private parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        const cleaned = skills.replace(/^{|}$/g, '').replace(/"/g, '');
        return cleaned.split(',').map(s => s.trim()).filter(s => s);
      } catch (e) {
        console.error('Error parsing skills:', e);
        return [];
      }
    }
    return [];
  }

  createEmptyJob(): Job {
    return {
      id: 0,
      title: '',
      company: '',
      description: '',
      required_skills: [],
      preferred_skills: [],
      experience_required: 0,
      location: '',
      salary_range: '',
      job_type: 'Full-time',
      posted_date: new Date().toISOString().split('T')[0]
    };
  }

  startNewJob(): void {
    this.currentJob = this.createEmptyJob();
    this.isEditing = false;
    this.clearMessages();
    this.newSkill = '';
  }

  editJob(job: Job): void {
    this.currentJob = { ...job };
    this.isEditing = true;
    this.clearMessages();
    this.newSkill = '';
  }

  saveJob(): void {
    this.clearMessages();
    
    if (!this.validateJob()) {
      return;
    }

    // Create a properly typed request payload
    const jobRequestPayload = {
      title: this.currentJob.title,
      company: this.currentJob.company,
      description: this.currentJob.description,
      requiredSkills: this.currentJob.required_skills.join(','),
      preferredSkills: null,
      experienceRequired: this.currentJob.experience_required,
      jobType: this.currentJob.job_type,
      location: this.currentJob.location,
      salaryRange: this.currentJob.salary_range,
      postedDate: this.currentJob.posted_date
    };

    const observable = this.isEditing 
      ? this.adminJobService.updateJob(this.currentJob.id, jobRequestPayload)
      : this.adminJobService.createJob(jobRequestPayload);

    observable.subscribe({
      next: (savedJob) => {
        this.successMessage = this.isEditing 
          ? 'Job updated successfully!' 
          : 'Job created successfully!';
        this.loadJobs();
        this.startNewJob();
      },
      error: (err) => {
        this.errorMessage = 'Failed to save job. Please check the console for details.';
        console.error('Error saving job:', err);
        if (err.error) {
          console.error('Server error details:', err.error);
        }
      }
    });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminJobService.deleteJob(id).subscribe({
        next: () => {
          this.successMessage = 'Job deleted successfully!';
          this.loadJobs();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete job. Please try again.';
          console.error(err);
        }
      });
    }
  }

  validateJob(): boolean {
    if (!this.currentJob.title.trim()) {
      this.errorMessage = 'Title is required';
      return false;
    }
    if (!this.currentJob.company.trim()) {
      this.errorMessage = 'Company is required';
      return false;
    }
    if (!this.currentJob.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (!this.currentJob.required_skills || this.currentJob.required_skills.length === 0) {
      this.errorMessage = 'At least one required skill is needed';
      return false;
    }
    return true;
  }

  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  addSkill(): void {
    const skill = this.newSkill.trim();
    if (skill && !this.currentJob.required_skills.includes(skill)) {
      this.currentJob.required_skills.push(skill);
      this.newSkill = '';
    }
  }

  removeSkill(index: number): void {
    this.currentJob.required_skills.splice(index, 1);
  }
}