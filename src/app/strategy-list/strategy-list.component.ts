import { Component, signal,inject } from '@angular/core';
import { StrategySetting } from '../@interface/wealth-map';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddStrategyComponent } from '../@dialog/dialog-add-strategy/dialog-add-strategy.component';
import { AUTO_STYLE } from '@angular/animations';
import { filter, take } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-strategy-list',
  imports: [
    CommonModule,
    FormsModule,MatIconModule
  ],
  templateUrl: './strategy-list.component.html',
  styleUrl: './strategy-list.component.scss'
})
export class StrategyListComponent {
  constructor(
    private router: Router,
    private exampleService:ExampleService,
    private httpClientService:HttpClientService
  ){}
  // 定義目前的頁籤狀態，預設為 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('strategy');
  // 三種身分 visitor;user;admin
  role!: string;
  userId!:number;
  userName!:string;


  showModal: boolean = true;
  // 追蹤正在編輯的卡片 (可以用 index 或 symbol)
  editingId: number | null = null;
  strategies:StrategySetting[]=[];
  originalStrategyBackup!:StrategySetting|null;
  // strategies:StrategySetting[]=[{
  //   id: 1,
  //   symbol: '0050',
  //   buyThreshold: 1,
  //   sellThreshold: 1,
  //   isActive: true,
  //   currentPrice: 75.8,
  //   lastClosePrice: 74.9,
  //   currentBias: 0.2
  // },{
  //   id: 2,
  //   symbol: '0056',
  //   buyThreshold: 1,
  //   sellThreshold: 1,
  //   isActive: true,
  //   currentPrice: 34.5,
  //   lastClosePrice: 36.1,
  //   currentBias: -3
  // }];


  ngOnInit(): void {
    this.loadData();
  }


  // 進入編輯模式
  startEdit(index: number) {
    this.editingId = index;
    //紀錄當前資料，以避免畫面被修改時，再按取消，不會復原。
    this.originalStrategyBackup = JSON.parse(JSON.stringify(this.strategies[index]));
  }


  // 儲存
  saveEdit(index: number) {
    if (this.editingId === null) return;
    const updatedStrategy = this.strategies[this.editingId];
    if(!updatedStrategy.buyThreshold || !updatedStrategy.sellThreshold ) {
      alert("提醒：加碼門檻及減碼門檻不能為空。");
      return;
    }
    if(updatedStrategy.buyThreshold >= updatedStrategy.sellThreshold) {
      alert("提醒：加碼門檻應小於減碼門檻。");
      return;
    }
    console.log(updatedStrategy);
    // 這裡執行 API 更新邏輯
    this.httpClientService.putApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/${updatedStrategy.id}`,updatedStrategy)
    .subscribe((res:any) => {
      console.log(res);
      if (res && res.code === 200) {
        console.log("更新成功，正在同步全域資料與重新渲染列表");
        this.exampleService.reloadUserContext();
        this.editingId = null;
      } else {
        console.error("更新失敗:", res.message);
        alert("儲存失敗：" + (res.message || "未知錯誤"));
      }


    });


  }
  // 取消
  cancelEdit() {
    if (this.editingId !== null && this.originalStrategyBackup) {
      // 還原原本的數值
      this.strategies[this.editingId] = this.originalStrategyBackup;
    }
    this.editingId = null;
    this.originalStrategyBackup = null;
  }


  //觸發dialog
  readonly dialog = inject(MatDialog);
  addStrategy(userId:number){




    let newStrategy:StrategySetting={
      id:this.userId,//借放userid
      symbol: '',
      buyThreshold: 0,
      sellThreshold: 0,
      isActive: false
    };
    // 開一個變數dialog用來存放你開啟的那個dialog
    let dialogRef = this.dialog.open(DialogAddStrategyComponent,{
      data: newStrategy
      ,width: '500px'
      // ,height: AUTO_STYLE
    });
    // 去偵測dialogRef這個dialog甚麼時候關閉
    dialogRef.afterClosed().subscribe((res) =>{
      //如果傳遞出來的資料有值，才進入if執行動作
      if(res){
        console.log(res);
        this.loadData();
      }


    })
  }


  onDelete(index: number){


    this.httpClientService.delApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/${this.strategies[index].id}`)
    .subscribe((res:any) => {
      if (res.code === 200) {
        // 畫面移除這張卡片
        this.strategies = this.strategies.filter(s => s.id !== this.strategies[index].id);
        this.exampleService.reloadUserContext();
      }


    });


  }


  loadData(){
    console.log("LoadData...");
    const user = this.exampleService.currentUser; // 💡 拿快照
    console.log(this.exampleService.currentUser);
    // 情況 A：已經有登入資料了 (從其他頁面過來)
    if (user && user.id !== 0) {
      this.userId = user.id;
      this.role = user.role;
      this.userName = user.name;
      this.fetchStrategies(this.userId); // 💡 直接執行抓取
    }
    // 情況 B：還沒拿到資料 (例如剛重新整理頁面)
    else {
      this.exampleService.user$.pipe(
        filter(u => u && u.id !== 0),
        take(1)
      ).subscribe(user => {
        if (user && user.id !== 0) {
          this.role = user.role; // 當角色改變，這裡會自動觸發
          this.userId = user.id;
          this.userName = user.name;
          this.fetchStrategies(this.userId);
        }
      });
    }


  }


  fetchStrategies(userId:number){
    console.log("Fetch Strategies...");
    this.strategies=this.exampleService.currentUser.strategySettings;
    // console.log(this.strategies);

    this.strategies = this.strategies.map((item: any): StrategySetting => ({
      id: item.id,
      symbol: item.symbol,
      buyThreshold: item.buyThreshold,
      sellThreshold: item.sellThreshold,
      isActive: item.isActive,
      currentPrice: 0,
      currentBias: 0,
      lastClosePrice: 0,
      date: '載入中...'
    }));

    // 針對每筆 symbol 去抓取報價
    this.strategies.forEach(s => {
      this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/strategy-set/quote/${s.symbol}`)
        .subscribe({
          next: (res: any) => {
            if (res.code===200 && res.data) {
              s.currentPrice = res.data.currentPrice ?? 0;
              s.currentBias = (res.data.bias ?? 0) * 100;
              s.date = "最新更新時間 : " + (res.data.date || '未知');
            } else {
              s.date = "查無資料";
              console.warn(`股票 ${s.symbol} 回傳 code:`+ res.code , res);
            }
          },
          error: (err) => {
            console.error(`無法獲取 ${s.symbol} 的報價`, err);
            s.date = "更新失敗";
          }
        });
    });

  }
}


