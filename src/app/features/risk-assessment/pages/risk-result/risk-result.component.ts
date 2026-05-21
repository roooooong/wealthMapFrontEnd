import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { StrategyResponse } from '../../models/risk.model';
import { ExampleService } from '../../../../@service/example.service';
import { InvalidComponent } from '../../../../@dialog/invalid/invalid.component';
import { MatDialog } from '@angular/material/dialog';
import { RiskService } from '../../services/risk.service';
import { take } from 'rxjs';

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
  riskLevel!:string;


  constructor(
    private router: Router,
    private exampleService: ExampleService,
    private riskService: RiskService) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      // 謗･謾ｶ result 謌・data
      this.resultData = navigation.extras.state['result'].data;
    }
  }

  ngOnInit(): void {
    // 髦ｲ蜻・
    // if (!this.resultData) {
    //   alert('辟｡隧穂ｼｰ雉・侭・瑚ｫ矩㍾譁ｰ騾ｲ陦梧ｸｬ鬩励・);
    //   this.router.navigate(['/risk-test']);
    // }
    this.exampleService.user$.pipe(take(1)).subscribe(user=>{
      if (user && user.id && user.id !== 0) {
        this.role = user.role;
        this.riskLevel = user.riskLevel;

        const newLevelFromTest = this.resultData?.['userLevel'];

        // 蜿ｪ譛峨梧ｸｬ鬩礼ｵ先棡蟄伜惠縲堺ｸ斐瑚・逶ｮ蜑榊倶ｺｺ讙疲｡井ｸ榊酔縲肴燕蝓ｷ陦・
        if (newLevelFromTest && user.riskLevel !== newLevelFromTest) {
          console.log('蛛ｵ貂ｬ蛻ｰ鬚ｨ髫ｪ遲臥ｴ壻ｸ堺ｸ閾ｴ・悟濤陦梧峩譁ｰ...');
          this.exampleService.reloadUserContext();
        }
      }
      console.log('迴ｾ蝨ｨ霄ｫ蛻・弍:'+this.role+',隧穂ｼｰ鬘槫梛轤ｺ:'+this.riskLevel);
      // 螯よ棡 constructor 豐呈響蛻ｰ雉・侭 (莉｣陦ｨ荳肴弍蜑帶ｸｬ螳瑚ｷｳ霓蛾℃萓・噪)
      if (!this.resultData) {
        if (this.role !== 'visitor' && this.riskLevel) {
          // --- 諠・ｳ・B・壽怎蜩｡・悟屓鬘ｧ闊頑怏邏骭・---
          this.fetchRiskStrategy(user.id, this.riskLevel);
        } else {
          alert('辟｡隧穂ｼｰ雉・侭・瑚ｫ矩㍾譁ｰ騾ｲ陦梧ｸｬ鬩励・);
          this.router.navigate(['/risk-test']);
        }
      }else{

        console.log('貂ｬ鬩怜ｮ檎ｵ先棡縲・);
      }

    });
  }

  private fetchRiskStrategy(userId:number,level: string): void {
    console.log('譛・藤・悟屓鬘ｧ闊頑怏邏骭・);
    this.riskService.getRiskResultByLevel(userId, level).subscribe({
      next: (res) => {
        this.resultData = res.data;
        setTimeout(() => this.initChart(), 300);
      },
      error: (err) => this.router.navigate(['/risk-test'])
    });
  }

  ngAfterViewInit(): void {
    if (this.resultData) {
      this.initChart();
      // setTimeout(() => this.initChart(), 300);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (!ctx || !this.resultData) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = Object.keys(this.resultData.allocation);
    const dataValues = Object.values(this.resultData.allocation) as number[];
    const wmColors = [
      '#1D68A2', //WM 阯・
      '#8FC3D9', //WM 豺ｺ阯・
      '#F28E76', //WM 迴顔霜邏・
      '#FDE0D3' //WM 邊画ｩ・
      // ,'#FDE0D3'  //WM 邏ｫ
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
              font: { size: 14, family: '蠕ｮ霆滓ｭ｣鮟鷹ｫ・ }
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
          //   // 貊鷹ｼ遘ｻ荳雁悉鬘ｯ遉ｺ逋ｾ蛻・ｯ・
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

  // 驥肴眠貂ｬ鬩・
  retryTest(): void {
    this.router.navigate(['/risk-test']);
  }

  readonly dialog = inject(MatDialog);
  // 謚戊ｳ・ｻｺ隴ｰ鬆・
  goToPortfolios(): void {
    if(this.role === 'visitor'){
      //蠕・ｪｿ謨ｴ...
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

    // 邨先棡鄙ｻ隴ｯ
    switch (upperLevel) {
      case 'CONSERVATIVE': return '菫晏ｮ亥梛';
      case 'DEFENSIVE': return '遨ｩ蛛･蝙・;
      // case 'BALANCED': return '蟷ｳ陦｡蝙・;
      case 'GROWTH': return '遨肴･ｵ蝙・;
      // case 'AGGRESSIVE': return '陦晏絢蝙・;
      default: return level;
    }
  }

  //蠕・ｪｿ謨ｴ...
  showDialog(no:number) {
    // 蝟ｮ驕ｸ
    //let dialogRef 譏ｯ螳｣蜻贋ｸ蛟玖ｮ頑丙 隶鍋ｳｻ邨ｱ遏･驕捺・蛟醍樟蝨ｨ隕∵磁謾ｶ蜩ｪ蛟掬ialog
    //(隕・幕蝠溽噪dialog鬆・擇逧・錐遞ｱ, {隕∝さ驕樒噪蛟ｼ蜥瑚ｨｭ螳嘲)
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data:no,
      width: '250px',
      height: '180px'
    });
    //蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    //螯よ棡dialog邨先據譛牙さ蛟ｼ蜃ｺ萓・res蟆ｱ譏ｯ驍｣蛟句ｼ
    dialogRef.afterClosed().subscribe((res) => {
      //螯よ棡譛牙ｼ蛯ｳ驕槫・萓・
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }
}
