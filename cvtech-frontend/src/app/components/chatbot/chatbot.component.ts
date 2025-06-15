// chatbot.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isOpen = false;
  isTyping = false;
  messages: { sender: string, text: string, time: Date }[] = [
    { 
      sender: 'bot', 
      text: 'Hello! I can help you with job matching and CV advice. What would you like to know?', 
      time: new Date() 
    }
  ];
  userMessage = '';

  constructor(private http: HttpClient) {}

  toggleChatbot() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    // Add user message
    const userMsg = { 
      sender: 'user', 
      text: this.userMessage, 
      time: new Date() 
    };
    this.messages.push(userMsg);
    
    // Show typing indicator
    this.isTyping = true;
    this.userMessage = '';

    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);

    // Call RASA endpoint
    this.http.get(`http://localhost:8080/candidates/chatbot?message=${encodeURIComponent(userMsg.text)}`, {
      responseType: 'text'
    }).subscribe({
      next: (response: string) => {
        this.messages.push({ 
          sender: 'bot', 
          text: response, 
          time: new Date() 
        });
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: (error) => {
        this.messages.push({ 
          sender: 'bot', 
          text: '⚠️ Error: Could not reach chatbot server.', 
          time: new Date() 
        });
        console.error(error);
        this.isTyping = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}