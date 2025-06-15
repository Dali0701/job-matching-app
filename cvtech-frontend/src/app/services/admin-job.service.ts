// admin-job.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface JobRequest {
  title: string;
  company: string;
  description: string;
  requiredSkills: string;
  preferredSkills: string | null;
  experienceRequired: number;
  jobType: string;
  location: string;
  salaryRange: string;
  postedDate: string;
}

interface JobResponse {
  id: number;
  title: string;
  company: string;
  description: string;
  requiredSkills: string;
  preferredSkills: string | null;
  experienceRequired: number;
  jobType: string;
  location: string;
  salaryRange: string;
  postedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminJobService {
  private apiUrl = `${environment.spring}/api/jobs`;

  constructor(private http: HttpClient) { }

  createJob(job: JobRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(this.apiUrl, job);
  }

  updateJob(id: number, job: JobRequest): Observable<JobResponse> {
    return this.http.put<JobResponse>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}