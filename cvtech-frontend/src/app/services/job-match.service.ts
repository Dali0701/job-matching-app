// src/app/services/job-match.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobMatchService {
  private apiUrl = 'http://localhost:8080/api/job-matches';

  constructor(private http: HttpClient) { }

  getAllJobMatches(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getJobMatchesByCandidate(candidateId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?candidateId=${candidateId}`);
  }

  deleteJobMatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}