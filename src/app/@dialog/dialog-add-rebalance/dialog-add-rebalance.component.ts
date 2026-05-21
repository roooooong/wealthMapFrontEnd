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
        // 蜆ｲ蟄俶園譛牙次蟋玖ｳ・箸・御ｾ幄ｨ育ｮ嶺ｽｿ逕ｨ
        this.assets = user.assets || [];
        // 謚灘叙謇譛芽ｳ・箸・御ｸｦ驕取ｿｾ謗牙ｷｲ邯灘惠荳ｻ鬆・擇貂・粍荳ｭ逧・ぃ逾ｨ
        const apiUrl = `https://wealthmapbackend-production-5c68.up.railway.app/api/assets/rebalance/available-stocks/${this.userId}`;
        this.httpClientService.getApi(apiUrl).subscribe((res: any) => {
          if(!res) return;
          this.filteredStocks = res;
        });
      }
    });

    const apiUrl = `https://wealthmapbackend-production-5c68.up.railway.app/api/assets/user/${this.userId}`;
  }

  onStockChange() {
    if (!this.newAsset.stockId) {
      this.currentPrice = 0;
      this.newAsset.sharesOwned = 0;
      return;
    }

    if(this.assets.some(a => a.type === 'STOCK' && a.symbol === this.newAsset.stockId )){

      // 1. 蠕・allAssets 荳ｭ驕取ｿｾ蜃ｺ謇譛臥ｬｦ蜷郁ｩｲ symbol 逧・ぃ逾ｨ雉・箸
      const matchingAssets = this.assets.filter(
            a => a.type === 'STOCK' && a.symbol === this.newAsset.stockId
          );
      const totalShares = matchingAssets.reduce((sum, current) => sum + current.shares, 0);
      console.log(matchingAssets);
      console.log('閧｡謨ｸ'+totalShares);

      // 騾呵｣｡蜈磯占ｨｭ轤ｺ 0・檎ｭ画響蛻ｰ迴ｾ蜒ｹ蠕悟惠 subscribe 陬｡險育ｮ玲ｯ碑ｼ・ｺ也｢ｺ
      this.newAsset.sharesOwned = totalShares || 0;

      // 縲先眠蠅樣呎ｮｵ縲托ｼ壼惠貂・粍荳ｭ謇ｾ蛻ｰ陲ｫ驕ｸ荳ｭ逧・ぃ逾ｨ迚ｩ莉ｶ
      // const selectedAsset = this.filteredStocks.find(s => s.symbol === this.newAsset.stockId);

      // if (selectedAsset) {
      //   this.newAsset.sharesOwned = selectedAsset.sharesOwned || 0;
      //   console.log('蟾ｲ閾ｪ蜍募｡ｫ蜈･閧｡謨ｸ:', this.newAsset.sharesOwned);
      // }
      this.isLoading = true;
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`)
      .subscribe((res: any) => {
        if (res.code === 200) {
          this.currentPrice = res.data.currentPrice;
          //險育ｮ苓ぃ謨ｸ・夂ｸｽ雉・箸鬘・/ 逡ｶ蜑榊ｸょ・
          if (this.currentPrice > 0) {
            this.totalAmount = this.newAsset.sharesOwned * this.currentPrice;
          }

        }

        this.isLoading = false;
      });

    }

    // const quoteUrl = `https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`;
    // // 迯ｲ蜿門叉譎ょｱ蜒ｹ
    // this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/quote/${this.newAsset.stockId}`)
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
      this.alertSymbol = "隲矩∈謫・ぃ逾ｨ鬆・岼縲・;
      return;
    }

    if (this.newAsset.targetPercentage <= 0 || this.newAsset.targetPercentage > 100) {
      this.alertInput = "逶ｮ讓吩ｽ疲ｯ泌ｿ・亥惠 1-100% 荵矩俣縲・;
      return;
    }

    this.dialogRef.close({
      ...this.newAsset,
      currentPrice: this.currentPrice
    });
  }
}
