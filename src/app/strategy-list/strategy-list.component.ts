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
  // 螳夂ｾｩ逶ｮ蜑咲噪鬆∫ｱ､迢諷具ｼ碁占ｨｭ轤ｺ 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('strategy');
  // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
  role!: string;
  userId!:number;
  userName!:string;


  showModal: boolean = true;
  // 霑ｽ雹､豁｣蝨ｨ邱ｨ霈ｯ逧・今迚・(蜿ｯ莉･逕ｨ index 謌・symbol)
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


  // 騾ｲ蜈･邱ｨ霈ｯ讓｡蠑・
  startEdit(index: number) {
    this.editingId = index;
    //邏骭・文蜑崎ｳ・侭・御ｻ･驕ｿ蜈咲吻髱｢陲ｫ菫ｮ謾ｹ譎ゑｼ悟・謖牙叙豸茨ｼ御ｸ肴怎蠕ｩ蜴溘・
    this.originalStrategyBackup = JSON.parse(JSON.stringify(this.strategies[index]));
  }


  // 蜆ｲ蟄・
  saveEdit(index: number) {
    if (this.editingId === null) return;
    const updatedStrategy = this.strategies[this.editingId];
    if(!updatedStrategy.buyThreshold || !updatedStrategy.sellThreshold ) {
      alert("謠宣・・壼刈遒ｼ髢讙ｻ蜿頑ｸ帷｢ｼ髢讙ｻ荳崎・轤ｺ遨ｺ縲・);
      return;
    }
    if(updatedStrategy.buyThreshold >= updatedStrategy.sellThreshold) {
      alert("謠宣・・壼刈遒ｼ髢讙ｻ諛牙ｰ乗名貂帷｢ｼ髢讙ｻ縲・);
      return;
    }
    console.log(updatedStrategy);
    // 騾呵｣｡蝓ｷ陦・API 譖ｴ譁ｰ驍剰ｼｯ
    this.httpClientService.putApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/${updatedStrategy.id}`,updatedStrategy)
    .subscribe((res:any) => {
      console.log(res);
      if (res && res.code === 200) {
        console.log("譖ｴ譁ｰ謌仙粥・梧ｭ｣蝨ｨ蜷梧ｭ･蜈ｨ蝓溯ｳ・侭闊・㍾譁ｰ貂ｲ譟灘・陦ｨ");
        this.exampleService.reloadUserContext();
        this.editingId = null;
      } else {
        console.error("譖ｴ譁ｰ螟ｱ謨・", res.message);
        alert("蜆ｲ蟄伜､ｱ謨暦ｼ・ + (res.message || "譛ｪ遏･骭ｯ隱､"));
      }


    });


  }
  // 蜿匁ｶ・
  cancelEdit() {
    if (this.editingId !== null && this.originalStrategyBackup) {
      // 驍・次蜴滓悽逧・丙蛟ｼ
      this.strategies[this.editingId] = this.originalStrategyBackup;
    }
    this.editingId = null;
    this.originalStrategyBackup = null;
  }


  //隗ｸ逋ｼdialog
  readonly dialog = inject(MatDialog);
  addStrategy(userId:number){




    let newStrategy:StrategySetting={
      id:this.userId,//蛟滓叛userid
      symbol: '',
      buyThreshold: 0,
      sellThreshold: 0,
      isActive: false
    };
    // 髢倶ｸ蛟玖ｮ頑丙dialog逕ｨ萓・ｭ俶叛菴髢句福逧・ぅ蛟掬ialog
    let dialogRef = this.dialog.open(DialogAddStrategyComponent,{
      data: newStrategy
      ,width: '500px'
      // ,height: AUTO_STYLE
    });
    // 蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    dialogRef.afterClosed().subscribe((res) =>{
      //螯よ棡蛯ｳ驕槫・萓・噪雉・侭譛牙ｼ・梧燕騾ｲ蜈･if蝓ｷ陦悟虚菴・
      if(res){
        console.log(res);
        this.loadData();
      }


    })
  }


  onDelete(index: number){


    this.httpClientService.delApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/${this.strategies[index].id}`)
    .subscribe((res:any) => {
      if (res.code === 200) {
        // 逡ｫ髱｢遘ｻ髯､騾吝ｼｵ蜊｡迚・
        this.strategies = this.strategies.filter(s => s.id !== this.strategies[index].id);
        this.exampleService.reloadUserContext();
      }


    });


  }


  loadData(){
    console.log("LoadData...");
    const user = this.exampleService.currentUser; // 庁 諡ｿ蠢ｫ辣ｧ
    console.log(this.exampleService.currentUser);
    // 諠・ｳ・A・壼ｷｲ邯捺怏逋ｻ蜈･雉・侭莠・(蠕槫・莉夜・擇驕惹ｾ・
    if (user && user.id !== 0) {
      this.userId = user.id;
      this.role = user.role;
      this.userName = user.name;
      this.fetchStrategies(this.userId); // 庁 逶ｴ謗･蝓ｷ陦梧鞄蜿・
    }
    // 諠・ｳ・B・夐ｄ豐呈響蛻ｰ雉・侭 (萓句ｦょ央驥肴眠謨ｴ逅・・擇)
    else {
      this.exampleService.user$.pipe(
        filter(u => u && u.id !== 0),
        take(1)
      ).subscribe(user => {
        if (user && user.id !== 0) {
          this.role = user.role; // 逡ｶ隗定牡謾ｹ隶奇ｼ碁呵｣｡譛・・蜍戊ｧｸ逋ｼ
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
      date: '霈牙・荳ｭ...'
    }));

    // 驥晏ｰ肴ｯ冗ｭ・symbol 蜴ｻ謚灘叙蝣ｱ蜒ｹ
    this.strategies.forEach(s => {
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/quote/${s.symbol}`)
        .subscribe({
          next: (res: any) => {
            if (res.code===200 && res.data) {
              s.currentPrice = res.data.currentPrice ?? 0;
              s.currentBias = (res.data.bias ?? 0) * 100;
              s.date = "譛譁ｰ譖ｴ譁ｰ譎る俣 : " + (res.data.date || '譛ｪ遏･');
            } else {
              s.date = "譟･辟｡雉・侭";
              console.warn(`閧｡逾ｨ ${s.symbol} 蝗槫さ code:`+ res.code , res);
            }
          },
          error: (err) => {
            console.error(`辟｡豕慕佐蜿・${s.symbol} 逧・ｱ蜒ｹ`, err);
            s.date = "譖ｴ譁ｰ螟ｱ謨・;
          }
        });
    });

  }
}


