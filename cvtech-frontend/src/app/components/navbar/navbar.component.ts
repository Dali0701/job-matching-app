import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // Make authService public for template access

  showAdminMenu = false;

  constructor(private router: Router, public authService: AuthService) {}


  toggleAdminMenu(event: Event): void {
    event.preventDefault();
    this.showAdminMenu = !this.showAdminMenu;
  }

  // Make event parameter optional
  navigateToAdmin(event?: Event) {
    event?.preventDefault();
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/jobs']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}