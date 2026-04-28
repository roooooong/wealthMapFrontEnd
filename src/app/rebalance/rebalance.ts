import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';
// 修正後的匯入路徑：必須包含資料夾層級
import { DialogAddRebalanceComponent } from '../@dialog/dialog-add-rebalance/dialog-add-rebalance.component';

@Component({
  selector: 'app-rebalance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './rebalance.html',
  styleUrl: './rebalance.scss'
})
export class Rebalance implements OnInit {
  private readonly dialog = inject(MatDialog);
  private httpClientService = inject(HttpClientService);
  private exampleService = inject(ExampleService);

  targetTotalValue: number = 0; // 畫面底部的預計投入總金額
  portfolio: any[] = [];
  userId: number = 0;

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.userId = user.id;
      }
    });
  }

  /**
   * 開啟彈窗
   */
  addAsset() {
    const dialogRef = this.dialog.open(DialogAddRebalanceComponent, {
      width: '450px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      // 接收來自 DialogAddRebalanceComponent 的回傳值
      if (result && result.stockId) {
        this.portfolio.push({
          stockId: result.stockId,
          currentPrice: result.currentPrice,
          sharesOwned: result.sharesOwned,
          targetPercentage: result.targetPercentage,
          suggestion: ''
        });
      }
    });
  }

  /**
   * 再平衡核心計算
   */
  calculateRebalance() {
    if (this.targetTotalValue <= 0) {
      alert('請先輸入預計投入總金額');
      return;
    }

    // 檢查總佔比是否為 100%
    const totalPercent = this.portfolio.reduce((sum, item) => sum + item.targetPercentage, 0);
    if (totalPercent !== 100) {
      alert(`目前總佔比為 ${totalPercent}%，請調整各項佔比使總和等於 100%`);
      return;
    }

    this.portfolio.forEach(item => {
      // 1. 計算目標金額
      const targetValue = this.targetTotalValue * (item.targetPercentage / 100);
      // 2. 計算目標股數 (目標金額 / 最新價格)
      const targetShares = Math.floor(targetValue / item.currentPrice);
      // 3. 計算差異 (目標股數 - 目前股數)
      const diff = targetShares - item.sharesOwned;

      if (diff > 0) {
        item.suggestion = `建議買進 ${diff} 股`;
      } else if (diff < 0) {
        item.suggestion = `建議賣出 ${Math.abs(diff)} 股`;
      } else {
        item.suggestion = `持股符合佔比`;
      }
    });
  }

  onDelete(index: number) {
    if (confirm('確定移除此項目？')) {
      this.portfolio.splice(index, 1);
    }
  }
}
