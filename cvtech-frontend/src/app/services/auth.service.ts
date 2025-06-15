// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminUser = true; 
  constructor() { }

  isAdmin(): boolean {
    return this.isAdminUser;
  }

  setAdminStatus(isAdmin: boolean): void {
    this.isAdminUser = isAdmin;
  }
}