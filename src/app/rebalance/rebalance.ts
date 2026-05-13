import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';
import { DialogAddRebalanceComponent } from '../@dialog/dialog-add-rebalance/dialog-add-rebalance.component';
import { MatIconModule } from '@angular/material/icon';

interface PortfolioItem {
  id?: number;          // 資料庫主鍵
  stockId: string;      // 對應資料庫 symbol
  currentPrice: number; // 使用者手動輸入，不存資料庫
  sharesOwned: number;  // 對應資料庫 current_shares
  targetPercentage: number; // 對應資料庫 target_percentage
  suggestion: string;
}

@Component({
  selector: 'app-rebalance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule,MatIconModule],
  templateUrl: './rebalance.html',
  styleUrl: './rebalance.scss'
})
export class Rebalance implements OnInit {
  private readonly dialog = inject(MatDialog);
  private httpClientService = inject(HttpClientService);
  private exampleService = inject(ExampleService);

  targetTotalValue: number = 0;
  portfolio: PortfolioItem[] = [];
  userId: number = 0;

  ngOnInit(): void {
    // 訂閱使用者資訊，取得 userId
    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.userId = user.id;
        this.loadPortfolioFromDb();
      }
    });
  }

  /**
   * 從資料庫載入已儲存的資產配置
   */
  loadPortfolioFromDb() {
    console.log(this.userId);
    this.httpClientService.getApi(`http://localhost:8080/api/rebalance/list/${this.userId}`).subscribe((res: any) => {
      if (res && Array.isArray(res)) {
        this.portfolio = res.map((item: any) => ({
          id: item.id,
          stockId: item.symbol,
          currentPrice: 0,
          sharesOwned: item.currentShares, // 資料庫欄位是 currentShares
          targetPercentage: item.targetPercentage,
          suggestion: ''
        }));

        if (this.portfolio) {
          console.log(this.portfolio);

          this.portfolio.forEach(s => {
            this.httpClientService.getApi(`http://localhost:8080/api/strategy-set/quote/${s.stockId}`)
              .subscribe({
                next: (res: any) => {
                  if (res.code === 200 && res.data) {
                    s.currentPrice = res.data.currentPrice ?? 0;
                  } else {
                    console.warn(`股票 ${s.stockId} 回傳 code:` + res.code, res);
                  }
                },
                error: (err) => {
                  console.error(`無法獲取 ${s.stockId} 的報價`, err);
                }
              });
          });
        }
      }
    });
  }

  /**
   * 新增資產並同步儲存至 MySQL
   */
  addAsset() {
    const dialogRef = this.dialog.open(DialogAddRebalanceComponent, {
      width: '450px',
      data: { existingSymbols: this.portfolio.map(p => p.stockId) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.stockId) {
        /**
         * 重要：這裡的 Key 名稱必須與 Java Entity 一致
         * symbol -> symbol
         * targetPercentage -> targetPercentage
         * currentShares -> currentShares (Dialog 傳回的是 sharesOwned)
         */
        const payload = {
          userId: this.userId,
          symbol: result.stockId,
          targetPercentage: result.targetPercentage,
          currentShares: result.sharesOwned // 將前端變數轉換為後端欄位名
        };
        console.log(payload);

        this.httpClientService.postApi('http://localhost:8080/api/rebalance/save', payload).subscribe({
          next: (savedItem: any) => {
            // 存檔成功後，將資料壓入畫面陣列
            // this.portfolio.push({
            //   id: savedItem.id,
            //   stockId: result.stockId,
            //   currentPrice: result.currentPrice || 0,
            //   sharesOwned: result.sharesOwned,
            //   targetPercentage: result.targetPercentage,
            //   suggestion: ''
            // });
            this.loadPortfolioFromDb();
          },
          error: (err) => {
            console.error('儲存失敗：', err);
            alert('儲存至資料庫時發生錯誤');
          }
        });
      }
    });
  }

  /**
   * 再平衡計算主邏輯
   */
  calculateRebalance() {
    if (this.targetTotalValue <= 0) {
      alert('請先輸入預計投入總金額');
      return;
    }

    const totalPercent = this.portfolio.reduce((sum, item) => sum + item.targetPercentage, 0);
    // 允許微小的浮點數誤差
    if (Math.abs(totalPercent - 100) > 0.01) {
      alert(`目前總佔比為 ${totalPercent}%，請調整至 100%`);
      return;
    }

    this.portfolio.forEach(item => {
      if (item.currentPrice > 0) {
        const targetValue = this.targetTotalValue * (item.targetPercentage / 100);
        const targetShares = Math.floor(targetValue / item.currentPrice);
        const diff = targetShares - item.sharesOwned;

        if (diff > 0) {
          item.suggestion = `建議買進 ${diff} 股`;
        } else if (diff < 0) {
          item.suggestion = `建議賣出 ${Math.abs(diff)} 股`;
        } else {
          item.suggestion = '持股符合佔比';
        }
      } else {
        item.suggestion = '請輸入市價';
      }
    });
  }

  /**
   * 刪除資產
   */
  onDelete(index: number) {
    const item = this.portfolio[index];
    if (confirm(`確定要移除 ${item.stockId} 嗎？`)) {
      if (item.id) {
        this.httpClientService.delApi(`http://localhost:8080/api/rebalance/delete/${item.id}`).subscribe(() => {
          this.portfolio.splice(index, 1);
        });
      } else {
        this.portfolio.splice(index, 1);
      }
    }
  }
}
