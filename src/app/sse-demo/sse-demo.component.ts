import { Component, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SseService } from '../@service/sse.service';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sse-demo',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TimelineModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TagModule

  ],
  templateUrl: './sse-demo.component.html',
  styleUrl: './sse-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SseDemoComponent implements OnDestroy  {
  private sseService = inject(SseService);
  private subscription: Subscription | null = null;


  // State
  userId = signal('test-user');
  isConnected = signal(false);
  messages = signal<SseMessage[]>([]);


  connect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }


    this.isConnected.set(true);
    this.subscription = this.sseService.getServerSentEvent(this.userId()).subscribe({
      next: (data) => {
        const newMessage: SseMessage = {
          id: Date.now(),
          content: data,
          timestamp: new Date(),
          type: data.includes('INIT') ? 'info' : 'success'
        };
        this.messages.update(prev => [newMessage, ...prev].slice(0, 10)); // Keep last 10
      },
      error: (err) => {
        console.error('SSE Error:', err);
        this.isConnected.set(false);
      },
      complete: () => {
        this.isConnected.set(false);
      }
    });
  }


  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.isConnected.set(false);
  }


  clearMessages() {
    this.messages.set([]);
  }


  ngOnDestroy() {
    this.disconnect();
  }

}

interface SseMessage {
  id: number;
  content: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}
