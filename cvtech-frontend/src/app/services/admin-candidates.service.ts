// src/app/services/admin-candidates.service.ts (renamed from candidate.service.ts)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminCandidate } from '../models/admin-candidate.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCandidatesService {
  private apiUrl = 'http://localhost:8080/api/candidates';

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<AdminCandidate[]> {
    return this.http.get<AdminCandidate[]>(this.apiUrl);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}