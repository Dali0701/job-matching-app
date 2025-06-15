import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ValidationError {
    field: string;
    messages: string[];
}

interface ApiErrorResponse {
    message?: string;
    errors?: ValidationError[] | { [key: string]: string[] };
    statusCode?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CvUploadService {
    private readonly apiUrl = 'http://localhost:8080/api/candidates';

    constructor(private http: HttpClient) {}

    private handleApiError(error: HttpErrorResponse): never {
        let errorMessage = 'Failed to upload CV';
        const apiError = error.error as ApiErrorResponse;

        if (error.status === 422) {
            if (apiError.errors) {
                if (Array.isArray(apiError.errors)) {
                    // Handle array format errors
                    errorMessage = apiError.errors
                        .map(err => `${err.field}: ${err.messages.join(', ')}`)
                        .join('; ');
                } else {
                    // Handle object format errors
                    errorMessage = Object.entries(apiError.errors)
                        .map(([field, messages]) => 
                            `${field}: ${(messages as string[]).join(', ')}`)
                        .join('; ');
                }
            } else {
                errorMessage = apiError.message || 'Validation failed';
            }
        } else if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            errorMessage = apiError.message || error.message || 'Server error';
        }

        throw new Error(errorMessage);
    }

    uploadCV(
        file: File,
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        skills: string
    ): Observable<HttpEvent<any>> {
        const formData = new FormData();
        formData.append('cv', file);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('skills', skills);

        return this.http.post(`${this.apiUrl}/upload`, formData, {
            reportProgress: true,
            observe: 'events'
        });
    }

    parseCV(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('cv', file, file.name);
        return this.http.post(`${this.apiUrl}/parse-cv`, formData);
    }
}