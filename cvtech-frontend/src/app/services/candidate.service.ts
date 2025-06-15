// src/app/services/candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Candidate {
  id?: string;  // Using email as ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: number;
  education: string[];
  jobTitle?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `http://localhost:8080/api/candidates`; // Adjust based on your FastAPI endpoint

  constructor(private http: HttpClient) { }

  // Get all candidates
  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  // Get a specific candidate by email
  getCandidateByEmail(email: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${email}`);
  }

  // Create a new candidate (if needed)
  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.apiUrl, candidate);
  }

  // Update a candidate
  updateCandidate(email: string, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${email}`, candidate);
  }

  // Delete a candidate
  deleteCandidate(email: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${email}`);
  }
}