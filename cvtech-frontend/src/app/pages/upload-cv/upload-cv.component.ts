import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CvUploadService } from '../../services/cv-upload.service';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-upload-cv',
  templateUrl: './upload-cv.component.html',
  styleUrls: ['./upload-cv.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class UploadCvComponent {
  registrationForm: FormGroup;
  cvFile: File | null = null;
  isDragging = false;
  isSubmitting = false;
  formSubmitted = false;
  uploadProgress = 0;
  uploadComplete = false;
  errorMessage: string | null = null;
  fileError: string | null = null;

  private readonly acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  // Temporary client-side job database for fallback matching
  private readonly fallbackJobs = [
    {
      id: 1,
      title: 'Software Developer',
      company: 'Tech Solutions Inc.',
      required_skills: ['python', 'java', 'javascript'],
      experience_required: 2
    },
    {
      id: 2,
      title: 'Data Analyst',
      company: 'Data Insights LLC',
      required_skills: ['python', 'sql', 'data analysis'],
      experience_required: 1
    }
  ];

  constructor(
    private fb: FormBuilder,
    private cvUploadService: CvUploadService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      skills: ['', [Validators.required, this.skillsValidator()]]
    });
  }

  private skillsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) return { required: true };

      if (/[^a-zA-Z0-9, ]/.test(value)) {
        return { invalidFormat: { message: 'Use commas to separate skills (e.g. "Java, Python")' } };
      }

      const skills = value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      if (skills.length === 0) {
        return { required: true };
      }

      return null;
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  private handleFile(file: File): void {
    this.fileError = null;
    
    if (!file) {
      this.fileError = 'No file selected';
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.fileError = 'Only PDF, DOC, and DOCX files are accepted';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.fileError = `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`;
      return;
    }

    this.cvFile = file;
  }

  removeFile(): void {
    this.cvFile = null;
    this.fileError = null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.registrationForm.invalid || !this.cvFile) {
      if (!this.cvFile) {
        this.fileError = 'Please upload your CV';
      }
      return;
    }

    this.prepareAndSubmitForm();
  }

  private prepareAndSubmitForm(): void {
    this.isSubmitting = true;
    this.errorMessage = null;
    this.uploadProgress = 0;

    const skillsValue = this.registrationForm.get('skills')?.value as string;
    const formattedSkills = skillsValue.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    if (!this.cvFile) {
      this.handleErrorResponse('Please select a CV file');
      return;
    }

    console.log('Submitting form with:', {
      formData: this.registrationForm.value,
      file: this.cvFile.name,
      size: this.cvFile.size,
      type: this.cvFile.type
    });

    this.cvUploadService.uploadCV(
      this.cvFile,
      this.registrationForm.get('firstName')?.value,
      this.registrationForm.get('lastName')?.value,
      this.registrationForm.get('email')?.value,
      this.registrationForm.get('phone')?.value,
      formattedSkills.join(',')
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          console.log(`Upload progress: ${this.uploadProgress}%`);
        } else if (event.type === HttpEventType.Response) {
          console.log('Full response:', event.body);
          if (event.body?.success) {
            this.handleUploadSuccess(event.body);
          } else {
            const errorMsg = this.formatErrorResponse(event.body);
            this.handleErrorResponse(errorMsg);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Full upload error:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        
        const errorMsg = this.formatHttpError(err);
        this.handleErrorResponse(errorMsg);
      }
    });
  }

  private formatErrorResponse(response: any): string {
    if (response?.errors) {
      return Object.entries(response.errors)
        .map(([field, messages]) => 
          `${this.formatFieldName(field)}: ${(messages as string[]).join(', ')}`
        )
        .join('; ');
    }
    return response?.message || 'Upload failed. Please try again.';
  }

  private formatHttpError(error: HttpErrorResponse): string {
    if (error.status === 422) {
      return this.formatErrorResponse(error.error);
    } else if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    } else if (error.status >= 500) {
      if (error.error?.message?.includes('AI processing')) {
        return 'CV analysis failed. Please try a different file or contact support.';
      }
      return 'Server error. Please try again later.';
    }
    return error.error?.message || error.message || 'Failed to upload CV';
  }

  private formatFieldName(field: string): string {
    const fieldNames: Record<string, string> = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'email': 'Email',
      'phone': 'Phone Number',
      'skills': 'Skills',
      'cv': 'CV File'
    };
    return fieldNames[field] || field;
  }

  private handleUploadSuccess(response: any): void {
    const candidateId = response.candidateId;
    if (!candidateId) {
      this.handleErrorResponse('Server response incomplete - missing candidate ID');
      return;
    }

    // Process skills to remove duplicates and clean up
    const cleanedSkills = this.cleanSkills(response.skills || this.getFormSkills());
    const experience = response.experience || 0;

    // Enhanced matching with fallback
    const matchedJobs = response.jobMatches?.length ? response.jobMatches : [];
    const topMatch = response.topMatch || this.findBestMatch(cleanedSkills, experience);

    this.uploadComplete = true;
    this.isSubmitting = false;
    
    this.navigateToJobMatches(
      candidateId,
      matchedJobs,
      topMatch,
      cleanedSkills,
      experience
    );
  }

  private cleanSkills(skills: string[]): string[] {
    // Remove duplicates and clean skill strings
    return [...new Set(skills.map(skill => 
        skill.toLowerCase()
            .replace(/\n/g, ' ')  // Replace newlines
            .replace(/\s+/g, ' ')  // Collapse whitespace
            .trim()
    ))];
  }

  private findBestMatch(skills: string[], experience: number): any {
    // Implement basic client-side matching if server didn't return matches
    const matchedJobs = this.fallbackJobs.map(job => {
      const matchingSkills = job.required_skills.filter(reqSkill => 
        skills.some(skill => skill.toLowerCase().includes(reqSkill.toLowerCase()))
      );
      
      const matchScore = Math.min(
        100,
        (matchingSkills.length / job.required_skills.length) * 100 +
        (experience >= job.experience_required ? 20 : 0)
      );
      
      return {
        ...job,
        matching_skills: matchingSkills,
        match_score: Math.round(matchScore)
      };
    }).filter(job => job.match_score > 40); // Only include decent matches

    if (matchedJobs.length === 0) return null;
    
    // Return the best match
    return matchedJobs.reduce((best, current) => 
      current.match_score > best.match_score ? current : best
    );
  }

  private getFormSkills(): string[] {
    return this.registrationForm.get('skills')?.value
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0) || [];
  }

  private navigateToJobMatches(
    candidateId: number,
    jobs: any[],
    topMatch: any,
    skills: string[],
    experience: number
  ): void {
    // If no matches from server, try client-side matching
    if (!jobs.length) {
      const clientMatch = this.findBestMatch(skills, experience);
      if (clientMatch) {
        jobs = [clientMatch];
        topMatch = clientMatch;
      }
    }

    setTimeout(() => {
      this.router.navigate(['/job-matches'], {
        state: {
          candidateId,
          jobs,
          topMatch,
          skills,
          experience,
          matchDate: new Date().toISOString(),
          source: jobs.length ? 'server' : 'client'
        }
      });
    }, 1000);
  }

  private handleErrorResponse(message: string): void {
    this.isSubmitting = false;
    this.uploadProgress = 0;
    this.errorMessage = message;
    console.error('Upload error:', message);
    
    // Reset form if it's a server error
    if (message.includes('Server error') || message.includes('CV analysis failed')) {
      this.cvFile = null;
    }
  }

  resetForm(): void {
    this.registrationForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      skills: ''
    });
    this.cvFile = null;
    this.formSubmitted = false;
    this.isSubmitting = false;
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.errorMessage = null;
    this.fileError = null;
  }
}