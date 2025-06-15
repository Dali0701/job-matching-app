import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminCandidatesService } from '../../../services/admin-candidates.service';
import { AdminCandidate } from '../../../models/admin-candidate.model';

@Component({
  selector: 'app-admin-candidates',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './admin-candidates.component.html',
  styleUrls: ['./admin-candidates.component.css']
})
export class AdminCandidatesComponent {
  candidates: AdminCandidate[] = [];
  filteredCandidates: AdminCandidate[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'skills', 'actions'];
  searchTerm: string = '';
  skillsFilter: string = '';

  constructor(private adminCandidatesService: AdminCandidatesService) {}

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.adminCandidatesService.getAllCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
        this.filteredCandidates = [...this.candidates];
      },
      error: (error) => console.error('Error fetching candidates', error)
    });
  }

  filterCandidates() {
    if (!this.searchTerm && !this.skillsFilter) {
      this.filteredCandidates = [...this.candidates];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    const skillsFilterLower = this.skillsFilter.toLowerCase();

    this.filteredCandidates = this.candidates.filter(candidate => {
      const nameMatch = `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTermLower);
      const emailMatch = candidate.email.toLowerCase().includes(searchTermLower);
      const phoneMatch = candidate.phone?.toLowerCase().includes(searchTermLower);
      
      const skillsMatch = skillsFilterLower ? 
        this.getSkillsArray(candidate.skills).some(skill => 
          skill.toLowerCase().includes(skillsFilterLower)
        ) : true;

      return (nameMatch || emailMatch || phoneMatch) && skillsMatch;
    });
  }

  getSkillsArray(skills: string): string[] {
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }

  deleteCandidate(id: number) {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.adminCandidatesService.deleteCandidate(id).subscribe({
        next: () => {
          this.loadCandidates();
        },
        error: (err) => {
          console.error('Error deleting candidate:', err);
          alert('Failed to delete candidate. Please try again.');
        }
      });
    }
  }
}