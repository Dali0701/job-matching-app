import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CvProcessingService {
  private apiUrl = 'http://localhost:8000'; // Make sure this matches your FastAPI port

  constructor(private http: HttpClient) {}

  uploadAndProcessCV(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(`${this.apiUrl}/upload-and-process`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(error => {
        console.error('CV Processing Error:', error);
        return throwError(() => error);
      })
    );
  }
}