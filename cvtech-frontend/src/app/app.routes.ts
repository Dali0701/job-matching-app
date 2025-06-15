import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { UploadCvComponent } from './pages/upload-cv/upload-cv.component';
import { JobMatchesComponent } from './pages/job-matches/job-matches.component';
import { AdminJobManagementComponent } from './components/admin-job-management/admin-job-management.component';
import { AdminJobMatchesComponent } from './components/admin-job-management/job-matches/job-matches.component';
import { AdminCandidatesComponent } from './components/admin-job-management/admin-candidates/admin-candidates.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'upload-cv', component: UploadCvComponent },
  { path: 'job-matches', component: JobMatchesComponent },
  { 
    path: 'admin/jobs', 
    component: AdminJobManagementComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/job-matches', 
    component: AdminJobMatchesComponent,
    canActivate: [AuthGuard],
  },
  { 
    path: 'admin/admin-candidates', 
    component: AdminCandidatesComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'home' }
];