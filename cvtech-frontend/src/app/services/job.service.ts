import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Job } from '../models/job.model';
import { JobMatch } from '../models/job-match.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.spring}/api/jobs`;

  constructor(private http: HttpClient) { }

  getAllJobs(): Observable<{ jobs: Job[], status: string }> {
    return this.http.get<{ jobs: Job[], status: string }>(this.apiUrl);
  }

  getMatchedJobs(resumeId: string): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.apiUrl}/matches/${resumeId}`);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }
}