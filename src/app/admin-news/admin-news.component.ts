import { Component } from '@angular/core';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { News } from '../@interface/news';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-news',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatSlideToggleModule, FormsModule],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.scss'
})
export class AdminNewsComponent {
  constructor(
    private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService
  ) { }

  newsList: News[] = [];

  //去新聞頁面
  goNewsUrl(newsUrl: string) {
    window.open(newsUrl, '_blank');
  }

  onToggle(news: News) {
    const nextStatus = !news.hidden;
    console.log("id", news.id, "nextStatus", nextStatus);

    this.httpClientService.postApi(`https://wealthmapbackend-production-412c.up.railway.app/api/news/${news.id}/hide?hide=${nextStatus}`)
      .subscribe((res: any) => {
        console.log('有成功嗎?', res);
        news.hidden = nextStatus;
      });
  }

  fetchNews() {
    this.httpClientService.getApi(`https://wealthmapbackend-production-412c.up.railway.app/api/news/admin/list`).subscribe({
      next: (data: any) => {
        this.newsList = data; // 更新陣列，HTML 會自動重新渲染
        console.log('✅ 數據已與伺服器同步');
      },
      error: (err) => {
        console.error('❌ 無法獲取最新數據', err);
      }
    });
  }
  // 分頁參數
  p: number = 1;              // 當前頁碼 (前端顯示從 1 開始)
  totalItems: number = 0;     // 總筆數
  itemsPerPage: number = 5;  // 每頁幾筆
  totalPages: number = 0;     // 總頁數 (新增：用來判斷下一頁按鈕是否禁用)

  fetchData() {
    // 💡 安全檢查：確保 p 不會小於 1
    if (this.p < 1) this.p = 1;

    // Spring Boot 頁碼從 0 開始，所以要 p - 1
    const url = `https://wealthmapbackend-production-412c.up.railway.app/api/news/admin/list?page=${this.p - 1}&size=${this.itemsPerPage}`;

    this.httpClientService.getApi(url).subscribe({
      next: (res: any) => {
        // 💡 務必確認 res 內的 key 與後端 HashMap 回傳的一致
        this.newsList = res.news || [];
        this.totalItems = res.totalItems || 0;
        this.totalPages = res.totalPages || 0; // 從後端直接拿總頁數最準確

        // 如果當前頁碼超過總頁數（例如刪除資料後），自動回到最後一頁
        if (this.p > this.totalPages && this.totalPages > 0) {
          this.p = this.totalPages;
          this.fetchData();
        }

        console.log(`載入第 ${this.p} 頁，總筆數：${this.totalItems}`);
      },
      error: (err) => {
        console.error('後台抓取新聞失敗：', err);
        // 可以在這裡加個通知，例如：this.message.error('載入失敗');
      }
    });
  }
  // 當使用者點擊頁碼時觸發
  pageChanged(event: any) {
    this.p = event;
    this.fetchData();
  }
  ngOnInit(): void {
    // 取得後台新聞列表
    this.fetchData();
  }
}
