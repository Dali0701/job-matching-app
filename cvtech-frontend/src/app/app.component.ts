import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,  
    ChatbotComponent  
  ],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-chatbot></app-chatbot>
  `,
  styles: []
})
export class AppComponent {
  title = 'CVTech';
}