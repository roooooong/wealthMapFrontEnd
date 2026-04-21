import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientService } from '../@service/http-client.service';

export interface Asset {
  stockId: string;
  currentPrice: number;
  sharesOwned: number;      // 對應原本的買入門檻位置
  targetPercentage: number; // 對應原本的賣出門檻位置
  suggestion?: string;      // 後端回傳的建議：如「買入 10 股」
}

@Component({
  selector: 'app-rebalance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rebalance.html',
  styleUrl: './rebalance.scss'
})
export class Rebalance implements OnInit {
  targetTotalValue: number = 0; // 預計投入總金額
  portfolio: Asset[] = [];      // 資產清單
  editingId: number | null = null; // 目前正在編輯的卡片索引

  constructor(private httpClientService: HttpClientService) {}

  ngOnInit(): void {
    // 預設幾筆初始資料
    this.portfolio = [
      { stockId: '2330', currentPrice: 800, sharesOwned: 10, targetPercentage: 40 },
      { stockId: '2317', currentPrice: 150, sharesOwned: 50, targetPercentage: 60 }
    ];
  }

  // 開始編輯
  startEdit(index: number) {
    this.editingId = index;
  }

  // 儲存編輯
  saveEdit(index: number) {
    this.editingId = null;
  }

  // 取消編輯
  cancelEdit() {
    this.editingId = null;
  }

  // 刪除資產
  onDelete(index: number) {
    this.portfolio.splice(index, 1);
  }

  // 新增資產 (對應原本的 empty-card)
  addAsset() {
    this.portfolio.push({
      stockId: '新標的',
      currentPrice: 0,
      sharesOwned: 0,
      targetPercentage: 0
    });
    this.editingId = this.portfolio.length - 1; // 自動進入編輯模式
  }

  // 呼叫後端計算
  calculateRebalance() {
    const payload = {
      targetTotalValue: this.targetTotalValue,
      portfolio: this.portfolio.map(a => ({
        ...a,
        targetPercentage: a.targetPercentage / 100 // 轉為小數送後端
      }))
    };

    // 呼叫後端 API (請確認 URL 與後端一致)
    this.httpClientService.postApi('http://localhost:8080/api/calculate', payload)
      .subscribe((res: any) => {
        this.portfolio = res; // 後端回傳帶有建議的清單
      });
  }
}
