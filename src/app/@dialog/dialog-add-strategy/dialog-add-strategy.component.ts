import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { StrategySetting } from '../../@interface/wealth-map';
import { HttpClientService } from '../../@service/http-client.service';
import { CommonModule } from '@angular/common';
import { ExampleService } from '../../@service/example.service';


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
    private exampleService:ExampleService,
    private httpClientService:HttpClientService
  ){}
  // 讓這個dialogRef全域變數 等於你後面宣告的DialogComponent
  // 後面要去做關閉才知道要關閉哪個dialog
  readonly dialogRef = inject(MatDialogRef<DialogAddStrategyComponent>);
  // 讓data全域變數用來接收你開啟dialog時傳遞進來的資料
  readonly data = inject<any>(MAT_DIALOG_DATA);
  userId!:number;
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

  alertSymbol!:string;
  alertBias!:string;

  ngOnInit(): void {
    console.log(this.data);
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.userId = user.id;
        this.httpClientService.getApi(`https://wealthmapbackend-production-412c.up.railway.app/api/strategy-set/user/available-stocks/${this.userId}`)
        .subscribe((res:any) => {
          if(!res) return;
          this.userHolding = res;
          console.log(this.userHolding);


        });
      }
    });
  }




  onStockChange(){
    const symbol = this.newStrategy.symbol;
    if (!symbol) return;


    this.isLoading = true; // 開啟讀取動畫




    this.httpClientService.getApi(`https://wealthmapbackend-production-412c.up.railway.app/api/strategy-set/quote/${symbol}`)
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
    this.alertSymbol="";
    this.alertBias="";

    if(!this.newStrategy.symbol){
      this.alertSymbol="請選擇欲設定加減碼門檻的項目。";
    }
    if(!this.newStrategy.buyThreshold && !this.newStrategy.sellThreshold){
      this.alertBias+="請設定加減碼門檻，數字不能為空。";
    }
    if(this.newStrategy.buyThreshold >= this.newStrategy.sellThreshold){
      this.alertBias+="加碼門檻應小於減碼門檻。";
    }

    if(this.alertSymbol || this.alertBias){
      alert("請檢查欲設定加減碼門檻的項目及加減碼門檻。");
      return;
    }


    console.log(this.newStrategy);
    // 這裡執行 API 更新邏輯
    this.httpClientService.postApi(`https://wealthmapbackend-production-412c.up.railway.app/api/strategy-set/user/${this.userId}`,this.newStrategy)
    .subscribe((res:any) => {
      if (res.code === 200) {
        this.exampleService.reloadUserContext();
        // 成功後才關閉，並把結果傳回給父元件
        this.dialogRef.close(res.data);
      } else {
        alert("儲存失敗：" + res.message);
      }


    });








  }
}
