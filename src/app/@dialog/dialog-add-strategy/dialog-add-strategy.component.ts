import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { StrategySetting } from '../../@interface/wealth-map';
import { HttpClientService } from '../../@service/http-client.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-add-strategy',
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './dialog-add-strategy.component.html',
  styleUrl: './dialog-add-strategy.component.scss'
})
export class DialogAddStrategyComponent {
  constructor(
    private httpClientService:HttpClientService
  ){}
  // 讓這個dialogRef全域變數 等於你後面宣告的DialogComponent
  // 後面要去做關閉才知道要關閉哪個dialog
  readonly dialogRef = inject(MatDialogRef<DialogAddStrategyComponent>);
  // 讓data全域變數用來接收你開啟dialog時傳遞進來的資料
  readonly data = inject<any>(MAT_DIALOG_DATA);
  userid:number=2;
  newStrategy:StrategySetting={
    symbol: '',
    buyThreshold: 0,
    sellThreshold: 0,
    isActive: true
  };
  userHolding:string[]=[];
  currentPrice!:number;
  currentBias!:number;
  isLoading: boolean = false;

  ngOnInit(): void {
    console.log(this.data);
    this.httpClientService.getApi(`http://localhost:8080/api/strategy-set/user/available-stocks/${this.userid}`)
    .subscribe((res:any) => {
      if(!res) return;
      this.userHolding = res;
      console.log(this.userHolding);

    });
  }


  onStockChange(){
    const symbol = this.newStrategy.symbol;
    if (!symbol) return;

    this.isLoading = true; // 開啟讀取動畫


    this.httpClientService.getApi(`http://localhost:8080/api/strategy-set/quote/${symbol}`)
    .subscribe((res:any) => {
      console.log(res);
      if (res.code === 200) {
        // 更新畫面上的唯讀欄位
        this.currentPrice = res.data.currentPrice;
        this.currentBias = res.data.bias;

        // 如果你想預設一些門檻值，也可以在這裡做
        this.newStrategy.buyThreshold = -5; // 預設跌 5% 加碼
        this.newStrategy.sellThreshold = 10; // 預設漲 10% 減碼
      }else{
        console.log('抓取價格失敗');
      }
      this.isLoading = false;

    });

  }

  //取消新增問題
  cancel(){
    this.dialogRef.close();
  }

  //新增問題
  confirm(){

    if(!this.newStrategy.symbol){
      alert("請選擇欲設定加減碼門檻的項目。");
      return;

    }else if(!this.newStrategy.buyThreshold && !this.newStrategy.sellThreshold){
      alert("請設定加減碼門檻，數字不能為空。");
      return;
    }

    console.log(this.newStrategy);
    // 這裡執行 API 更新邏輯
    this.httpClientService.postApi(`http://localhost:8080/api/strategy-set/user/${this.userid}`,this.newStrategy)
    .subscribe((res:any) => {
      if (res.code === 200) {
        // 成功後才關閉，並把結果傳回給父元件
        this.dialogRef.close(res.data);
      } else {
        alert("儲存失敗：" + res.message);
      }

    });




  }
}
