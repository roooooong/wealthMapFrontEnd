import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { StrategyResponse } from '../../models/risk.model';
import { ExampleService } from '../../../../@service/example.service';
import { InvalidComponent } from '../../../../@dialog/invalid/invalid.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-risk-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-result.component.html',
  styleUrls: ['./risk-result.component.scss']
}
)
export class RiskResultComponent implements OnInit, AfterViewInit {

  resultData: StrategyResponse | null = null;
  private chart: Chart | null = null;
  role:string = 'visitor';

  constructor(
    private router: Router,
    private exampleService: ExampleService) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      // 接收 result 或 data
      this.resultData = navigation.extras.state['result'].data || navigation.extras.state['data'];
    }
  }

  ngOnInit(): void {
    // 防呆
    if (!this.resultData) {
      alert('無評估資料，請重新進行測驗。');
      this.router.navigate(['/risk-test']);
    }
    this.exampleService.user$.subscribe(user=>{
      this.role = user.role;
    });
  }

  ngAfterViewInit(): void {
    if (this.resultData) {
      this.initChart();
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (!ctx || !this.resultData) return;

    const labels = Object.keys(this.resultData.allocation);
    const dataValues = Object.values(this.resultData.allocation) as number[];
    const wmColors = [
      '#1D68A2', //WM 藍
      '#8FC3D9', //WM 淺藍
      '#F28E76', //WM 珊瑚紅
      '#FDE0D3' //WM 粉橘
      // ,'#FDE0D3'  //WM 紫
    ];

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: wmColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 14, family: '微軟正黑體' }
            }
          },
          tooltip: {
            yAlign: 'bottom',
            backgroundColor: 'rgb(255, 255, 255)',
            titleColor: '#333',
            bodyColor: '#666',
            cornerRadius: 20,
            padding: 12,
            borderColor: '#4091c9',
            borderWidth: 1,
            displayColors: false,
            boxPadding: 5,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: ${value}%`;
              }
            }
          }
          // tooltip: {
          //   // 滑鼠移上去顯示百分比
          //   callbacks: {
          //     label: (context) => {
          //       const label = context.label || '';
          //       const value = context.parsed || 0;
          //       return ` ${label}: ${value}%`;
          //     }
          //   }
          // }
        },
        layout: {
          padding: 10
        }
      }
    });
  }

  // 重新測驗
  retryTest(): void {
    this.router.navigate(['/risk-test']);
  }

  readonly dialog = inject(MatDialog);
  // 投資建議頁
  goToPortfolios(): void {
    if(this.role === 'visitor'){
      //待調整...
      this.showDialog(8);
    }else{
      const userLevelChinese = this.translateLevel(this.resultData?.['userLevel'] || '');
      const userLevel = this.resultData?.['userLevel'] || '';
      this.router.navigate(['/portfolio-recommendation'], { state: { levelChinese: userLevelChinese, level: userLevel } });
    }

  }
  translateLevel(level: string): string {
    if (!level) return '';
    const upperLevel = level.toUpperCase();

    // 結果翻譯
    switch (upperLevel) {
      case 'CONSERVATIVE': return '保守型';
      case 'DEFENSIVE': return '穩健型';
      // case 'BALANCED': return '平衡型';
      case 'GROWTH': return '積極型';
      // case 'AGGRESSIVE': return '衝刺型';
      default: return level;
    }
  }

  //待調整...
  showDialog(no:number) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data:no,
      width: '250px',
      height: '180px'
    });
    //去偵測dialogRef這個dialog甚麼時候關閉
    //如果dialog結束有傳值出來 res就是那個值
    dialogRef.afterClosed().subscribe((res) => {
      //如果有值傳遞出來
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }
}
