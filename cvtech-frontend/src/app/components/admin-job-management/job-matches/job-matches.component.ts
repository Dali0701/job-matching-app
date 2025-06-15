import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { JobService } from '../../../services/job.service';
import { JobMatchService } from '../../../services/job-match.service';
import { CandidateService } from '../../../services/candidate.service';
import { Job } from '../../../models/job.model';
import { JobMatch } from '../../../models/admin-job-match.model';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './job-matches.component.html',
  styleUrls: ['./job-matches.component.css']
})
export class AdminJobMatchesComponent implements OnInit {
  matches: JobMatch[] = [];
  jobs: Job[] = [];
  candidates: Candidate[] = [];
  filteredMatches: JobMatch[] = [];
  companyFilter: string = '';
  searchTerm: string = '';
  isLoading = true;
  displayedColumns: string[] = ['candidate', 'email', 'job', 'match', 'date', 'actions'];
  sortDirection: 'asc' | 'desc' = 'desc'; // Default sort direction (high to low)

  constructor(
    private jobMatchService: JobMatchService,
    private jobService: JobService,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.jobService.getAllJobs().subscribe({
      next: (response) => {
        this.jobs = response.jobs;
        this.loadCandidates();
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.isLoading = false;
      }
    });
  }

  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.loadJobMatches();
      },
      error: (err) => {
        console.error('Error loading candidates:', err);
        this.isLoading = false;
      }
    });
  }

  loadJobMatches(): void {
    this.jobMatchService.getAllJobMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
        this.filteredMatches = [...matches];
        this.sortMatches(); // Sort matches when first loaded
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading job matches:', err);
        this.isLoading = false;
      }
    });
  }

  getJobDetails(jobId: number): Job | undefined {
    return this.jobs.find(job => job.id === jobId);
  }

  getCandidateDetails(candidateId: string): Candidate | undefined {
    return this.candidates.find(candidate => candidate.email === candidateId);
  }

  filterMatches(): void {
    if (!this.searchTerm && !this.companyFilter) {
      this.filteredMatches = [...this.matches];
      this.sortMatches(); // Re-sort after filtering
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    const companyFilterLower = this.companyFilter.toLowerCase();
    
    this.filteredMatches = this.matches.filter(match => {
      const job = this.getJobDetails(match.jobId);
      const candidate = this.getCandidateDetails(match.candidateId);
      
      const candidateMatch = candidate ? 
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTermLower) ||
        candidate.email.toLowerCase().includes(searchTermLower) : 
        match.candidateId.toLowerCase().includes(searchTermLower);
      
      const jobMatch = job ? 
        job.title.toLowerCase().includes(searchTermLower) : 
        false;
        
      const companyMatch = job ? 
        job.company.toLowerCase().includes(companyFilterLower) : 
        false;

      return (searchTermLower ? (candidateMatch || jobMatch) : true) && 
             (companyFilterLower ? companyMatch : true);
    });
    
    this.sortMatches(); // Re-sort after filtering
  }

  // New method to sort matches by score
  sortMatches(): void {
    this.filteredMatches.sort((a, b) => {
      if (this.sortDirection === 'desc') {
        return b.matchPercentage - a.matchPercentage; // High to low
      } else {
        return a.matchPercentage - b.matchPercentage; // Low to high
      }
    });
  }

  // New method to toggle sort direction
  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.sortMatches();
  }

  deleteMatch(id: number): void {
    if (confirm('Are you sure you want to delete this match record?')) {
      this.jobMatchService.deleteJobMatch(id).subscribe({
        next: () => {
          this.loadJobMatches();
        },
        error: (err) => {
          console.error('Error deleting match:', err);
        }
      });
    }
  }
}