import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HttpClientService } from '../../@service/http-client.service';
import { ExampleService } from '../../@service/example.service';
import { AssetDTO } from '../../@interface/wealth-map';

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
  assets:AssetDTO[] =[];
  totalAmount: number = 0;

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.userId = user.id;
        // 儲存所有原始資產，供計算使用
        this.assets = user.assets || [];
        // 抓取所有資產，並過濾掉已經在主頁面清單中的股票
        const apiUrl = `https://wealthmapbackend-production-85e8.up.railway.app/api/assets/rebalance/available-stocks/${this.userId}`;
        this.httpClientService.getApi(apiUrl).subscribe((res: any) => {
          if(!res) return;
          this.filteredStocks = res;
        });
      }
    });

    const apiUrl = `https://wealthmapbackend-production-85e8.up.railway.app/api/assets/user/${this.userId}`;
  }

  onStockChange() {
    if (!this.newAsset.stockId) {
      this.currentPrice = 0;
      this.newAsset.sharesOwned = 0;
      return;
    }

    // 1. 從 allAssets 中過濾出所有符合該 symbol 的股票資產
    const matchingAssets = this.assets.filter(
      a => a.type === 'STOCK' && a.symbol === this.newAsset.stockId
    );

    const totalShares = matchingAssets.reduce((sum, current) => sum + current.shares, 0);
    console.log(matchingAssets);
    console.log('股數'+totalShares);

    // 這裡先預設為 0，等拿到現價後在 subscribe 裡計算比較準確
    this.newAsset.sharesOwned = totalShares || 0;

    // 【新增這段】：在清單中找到被選中的股票物件
    // const selectedAsset = this.filteredStocks.find(s => s.symbol === this.newAsset.stockId);

    // if (selectedAsset) {
    //   this.newAsset.sharesOwned = selectedAsset.sharesOwned || 0;
    //   console.log('已自動填入股數:', this.newAsset.sharesOwned);
    // }
    this.isLoading = true;
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`)
    .subscribe((res: any) => {
      if (res.code === 200) {
        this.currentPrice = res.data.currentPrice;
        //計算股數：總資產額 / 當前市價
        if (this.currentPrice > 0) {
          this.totalAmount = this.newAsset.sharesOwned * this.currentPrice;
        }

      }

      this.isLoading = false;
    });

    // const quoteUrl = `https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`;
    // // 獲取即時報價
    // this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`)
    //   .subscribe((res: any) => {
    //     if (res.code === 200) {
    //       this.currentPrice = res.data.currentPrice;
    //     }
    //     this.isLoading = false;
    //   });
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
