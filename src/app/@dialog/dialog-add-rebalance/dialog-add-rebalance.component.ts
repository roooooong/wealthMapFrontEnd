import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HttpClientService } from '../../@service/http-client.service';
import { ExampleService } from '../../@service/example.service';

@Component({
  selector: 'app-dialog-add-rebalance',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './dialog-add-rebalance.component.html',
  styleUrl: './dialog-add-rebalance.component.scss'
})
export class DialogAddRebalanceComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DialogAddRebalanceComponent>);
  private readonly httpClientService = inject(HttpClientService);
  private readonly exampleService = inject(ExampleService);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  userId!: number;
  filteredStocks: any[] = [];
  currentPrice: number = 0;
  isLoading: boolean = false;

  newAsset = {
    stockId: '',
    sharesOwned: 0,
    targetPercentage: 0
  };

  alertSymbol: string = "";
  alertInput: string = "";

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.userId = user.id;
        // 抓取所有資產，並過濾掉已經在主頁面清單中的股票
        const apiUrl = `http://localhost:8080/api/assets/user/${this.userId}`;
        this.httpClientService.getApi(`http://localhost:8080/api/assets/user/${this.userId}`).subscribe((res: any) => {
          if (res && Array.isArray(res)) {
            const existing = this.data?.existingSymbols || [];
            this.filteredStocks = res.filter((stock: any) => !existing.includes(stock.symbol));
          }
        });
      }
    });
  }

  onStockChange() {
    if (!this.newAsset.stockId) {
    this.currentPrice = 0;
    this.newAsset.sharesOwned = 0;
    return;
  }

  // 【新增這段】：在清單中找到被選中的股票物件
  const selectedAsset = this.filteredStocks.find(s => s.symbol === this.newAsset.stockId);

  if (selectedAsset) {
    this.newAsset.sharesOwned = selectedAsset.sharesOwned || 0;
    console.log('已自動填入股數:', this.newAsset.sharesOwned);
  }
    this.isLoading = true;
    const quoteUrl = `http://localhost:8080/api/strategy-set/quote/${this.newAsset.stockId}`;
    // 獲取即時報價
    this.httpClientService.getApi(`http://localhost:8080/api/strategy-set/quote/${this.newAsset.stockId}`)
      .subscribe((res: any) => {
        if (res.code === 200) {
          this.currentPrice = res.data.currentPrice;
        }
        this.isLoading = false;
      });
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.alertSymbol = "";
    this.alertInput = "";

    if (!this.newAsset.stockId) {
      this.alertSymbol = "請選擇股票項目。";
      return;
    }

    if (this.newAsset.targetPercentage <= 0 || this.newAsset.targetPercentage > 100) {
      this.alertInput = "目標佔比必須在 1-100% 之間。";
      return;
    }

    this.dialogRef.close({
      ...this.newAsset,
      currentPrice: this.currentPrice
    });
  }
}
