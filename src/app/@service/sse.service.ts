import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  constructor(private _zone: NgZone) { }


  getServerSentEvent(userId: string): Observable<string> {
    return new Observable(observer => {
      // 連接到後端
      // const eventSource = new EventSource(`https://wealthmapbackend-production-5c68.up.railway.app/api/sse/subscribe/${userId}`);
      const eventSource = new EventSource(`https://wealthmapbackend-production-5c68.up.railway.app/api/sse/subscribe/${userId}`, { withCredentials: true });


      // 監聽後端自定義的 'message' 事件
      eventSource.addEventListener('message', event => {
        this._zone.run(() => {
          observer.next(event.data);
        });
      });


      // 監聽初始連線事件 'INIT'
      eventSource.addEventListener('INIT', event => {
        this._zone.run(() => {
          observer.next(event.data);
        });
      });


      // 監聽錯誤
      eventSource.onerror = error => {
        this._zone.run(() => {
          observer.error(error);
        });
      };


      // 當 Observable 被 unsubscribe 時關閉連線
      return () => eventSource.close();
    });
  }

}
