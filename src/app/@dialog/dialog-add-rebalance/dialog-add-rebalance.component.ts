import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HttpClientService } from '../../@service/http-client.service';
import { CommonModule } from '@angular/common';
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
  constructor(
    private exampleService: ExampleService,
    private httpClientService: HttpClientService
  ) {}

  readonly dialogRef = inject(MatDialogRef<DialogAddRebalanceComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  userId!: number;
  userHolding: string[] = [];
  currentPrice: number = 0;
  isLoading: boolean = false;

  // 再平衡專用資料結構
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
        this.httpClientService.getApi(`http://localhost:8080/api/strategy-set/user/available-stocks/${this.userId}`)
          .subscribe((res: any) => {
            if (res) this.userHolding = res;
          });
      }
    });
  }

  onStockChange() {
    if (!this.newAsset.stockId) return;
    this.isLoading = true;
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

    // 回傳完整資料給主頁面
    this.dialogRef.close({
      ...this.newAsset,
      currentPrice: this.currentPrice
    });
  }
}
