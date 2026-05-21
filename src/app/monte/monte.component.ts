import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import * as echarts from 'echarts';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { filter, take } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

interface InvestmentAsset {
  type: string;
  percentage: number;
  color: string;
}

interface SimulationScenario {
  id: number;
  name: string;
  assets: InvestmentAsset[];
}

export interface YearlyData {
  year: number;
  val: number;
  cost: number;
  confidenceHigh: number;
  confidenceMedium: number;
  confidenceLow: number;
}

export interface MonteResponse {
  pessimistic: number;
  normal: number;
  optimistic: number;
  totalInvestment: number;
  trajectories: YearlyData[];
}

@Component({
  selector: 'app-monte',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsDirective, MatIconModule],
  templateUrl: './monte.component.html',
  styleUrls: ['./monte.component.scss'],
  providers: [
    { provide: NGX_ECHARTS_CONFIG, useFactory: () => ({ echarts }) }
  ]
})
export class MonteComponent implements OnInit, AfterViewInit {
  historyLineOption: echarts.EChartsOption = {};
  private chartInstance: echarts.ECharts | undefined;
  role!: string;
  userId!: number;

  apiUrl!: string;
  apiResult: MonteResponse | null = null;
  allocationChart: Chart<'pie'> | undefined;

  planParams = [
    { label: '逶ｮ讓咎≡鬘・, value: 100 },
    { label: '譛溷・謚募・', value: 10 },
    { label: '豈乗怦謚募・', value: 10000 },
    { label: '蟷ｴ譛・, value: 10 }
  ];

  currentScenario: SimulationScenario = {
    id: 1,
    name: '蝓ｺ遉朱・鄂ｮ',
    assets: [
      { type: '閧｡逾ｨ', percentage: 35, color: '#85c1e9' },
      { type: '蛯ｵ蛻ｸ', percentage: 65, color: '#f9e79f' },
      { type: '鮟・≡', percentage: 0, color: '#f5c6cb' },
      { type: '迴ｾ驥・, percentage: 0, color: '#d1e7dd' }
    ]
  };

  totalAllocation: number = 100;
  allocationTotalError: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService
  ) {
    Chart.register(...registerables);
  }


  ngOnInit(): void {
    const user = this.exampleService.currentUser; // 庁 諡ｿ蠢ｫ辣ｧ
    console.log(this.exampleService.currentUser);
    // 諠・ｳ・A・壼ｷｲ邯捺怏逋ｻ蜈･雉・侭莠・(蠕槫・莉夜・擇驕惹ｾ・
    if (user && user.id !== 0) {
      this.userId = user.id;
      this.role = user.role;
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
        }
      });
    }
    this.apiUrl = `https://wealthmapbackend-production-5c68.up.railway.app/api/monte/simulate/${this.userId}`;
    this.currentScenario.assets.sort((a, b) => b.percentage - a.percentage);
    this.renderEmptyChart();
  }

  ngAfterViewInit(): void {
    this.renderAllocationChart();
  }

  onChartInit(ec: any) {
    this.chartInstance = ec;
  }


  updateChartWithInputs(assetType: string) {
    this.totalAllocation = this.currentScenario.assets.reduce((sum, asset) => sum + asset.percentage, 0);
    this.allocationTotalError = (this.totalAllocation !== 100);

    if (this.allocationChart && !this.allocationTotalError) {
      this.updateAllocationChart();
    }
  }

  private renderHistoryLineChart(data: YearlyData[]) {
    const targetValue = this.planParams[0].value * 10000;
    const years = data.map(d => `${d.year} `);

    this.historyLineOption = {
      title: {
        text: '謚戊ｳ・ｳ・箸謌宣聞讓｡謫ｬ',
        left: 'center',
        top: '5%', // 遞榊ｾｮ逡咏區
        textStyle: {
          fontSize: 16,           // 謾ｾ螟ｧ荳鮟樣ｻ・
          // color: '#033270',       // 菴ｿ逕ｨ菴逧・UI 豺ｱ阯崎牡
          fontFamily: 'sans-serif'
        },

      },
      // tooltip: {
      //   confine: true,
      //   trigger: 'axis',
      //   formatter: (params: any) => {
      //     let html = `<div><strong>隨ｬ  ${params[0].name} 蟷ｴ</strong></div>`;
      //     params.forEach((p: any) => {
      //       if (p.seriesName !== '蛻晏ｧ区兜蜈･') {
      //         const formattedValue = Math.round(p.value).toLocaleString();
      //         html += '<div>' + p.marker + p.seriesName + ': ' + formattedValue + '</div>';
      //       }
      //     });
      //     return html;
      //   }
      // },
      tooltip: {
        // 讓｣蠑剰ｨｭ螳・
        backgroundColor: 'rgba(255, 255, 255, 0.98)', // 邏皮區閭梧勹
        borderColor: '#4091c9',                       // 阯崎牡驍頑｡・
        borderWidth: 1,
        padding: 12,                                  // 蜈ｧ霍・
        borderRadius: 15,                             // 蝨楢ｧ・(ECharts 螻ｬ蜷咲ぜ borderRadius)
        textStyle: {
          color: '#666',                              // 蜈ｧ譁・｡剰牡
          fontSize: 14
        },
        confine: true,
        trigger: 'axis',
        formatter: (params: any) => {
          // 讓咎｡碁Κ蛻・ｼ壼ｰ肴㊨ titleColor: '#333'
          let html = `<div style="color: #333; font-weight: bold; margin-bottom: 8px;">隨ｬ ${params[0].name} 蟷ｴ</div>`;

          params.forEach((p: any) => {
            if (p.seriesName !== '蛻晏ｧ区兜蜈･') {
              // 謨ｸ蛟ｼ陌慕炊・壻ｽｿ逕ｨ菴蜴滓悽逧・ｼ蠑丞喧譁ｹ蠑・
              const formattedValue = Math.round(p.value).toLocaleString();

              // 蛻苓｡ｨ鬆・岼讓｣蠑・
              html += `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 4px 0;">
            <span style="display: flex; align-items: center;">
              ${p.marker} <!-- ECharts 閾ｪ蜍慕函謌千噪蝨馴ｻ・-->
              <span style="margin-left: 5px;">${p.seriesName}</span>
            </span>
            <span style="font-weight: bold; color: #333;">${formattedValue}</span>
          </div>
        `;
            }
          });
          return html;
        }
      },
      legend: { bottom: 0, data: ['謚募・譛ｬ驥・, '霈・ｽｳ鬆先悄', '荳闊ｬ陦ｨ迴ｾ', '霈・ｷｮ鬆先悄'] },
      grid: {
        left: '5%',
        right: '15%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '蟷ｴ',
        boundaryGap: false,
        data: years,
        axisLine: { show: true }
      },
      yAxis: {
        type: 'value',
        name: '驥鷹｡・,
        axisLine: { show: true },
        axisTick: { show: true },

        axisLabel: {
          formatter: (value: number) => {
            return (value / 10000).toFixed(0) + ' 關ｬ';
          }
        }
      },
      graphic: [
        {
          type: 'text',
          left: '20%',
          bottom: '18%',
          style: {
            text: ` 蛻・ 蟋・ 謚・ 蜈･  ${Math.round(data[0].cost / 10000)}  關ｬ`,
            font: 'bold 16px sans-serif',
            fill: '#666'
          }
        }
      ],
      series: [
        {
          name: '蛻晏ｧ区兜蜈･',
          type: 'line',
          data: data.map(() => data[0].cost),
          symbol: 'none',
          lineStyle: { width: 0 },
          areaStyle: {
            color: 'rgba(200, 200, 200, 0.4)',
            origin: 'start'
          },
          z: 10,
          tooltip: { show: false }
        },
        {
          name: '謚募・譛ｬ驥・,
          type: 'line',
          data: data.map(d => d.cost), itemStyle: { color: '#4091C9' },
          symbol: 'circle',
          smooth: true,
          markPoint: {
            symbol: 'none',
            data: [{
              coord: [data.length - 1, data[data.length - 1]!.confidenceHigh],
              value: Math.round(data[data.length - 1]!.confidenceHigh / 10000) + ' 關ｬ',
              label: { show: true, position: 'right', color: '#4091C9', fontWeight: 'bold', formatter: '{c}' }
            }]
          }
        },
        {
          name: '霈・ｽｳ鬆先悄',
          type: 'line',
          data: data.map(d => d.confidenceHigh),
          itemStyle: { color: '#67c23a' },
          symbol: 'none',
          smooth: true
        },
        {
          name: '荳闊ｬ陦ｨ迴ｾ',
          type: 'line',
          data: data.map(d => d.val),
          itemStyle: { color: '#f5b041' },
          symbol: 'none',
          smooth: true
        },
        {
          name: '霈・ｷｮ鬆先悄',
          type: 'line',
          data: data.map(d => d.confidenceLow),
          itemStyle: { color: '#f56c6c' },
          symbol: 'none',
          smooth: true,
          markLine: {
            symbol: ['none', 'none'],
            silent: true,
            data: [
              {
                yAxis: targetValue,
                label: {
                  show: true,
                  position: 'end',
                  formatter: (params: any) => `逶ｮ讓咎≡鬘構n \n ${params.value / 10000} 關ｬ`,
                  valueIndex: 0,
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: 14,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  padding: [2, 4]
                },
                lineStyle: {
                  color: '#033270',
                  type: 'solid',
                  width: 2
                }
              }
            ]
          }
        }
      ] as any,
    };
    this.cdr.detectChanges();
  }
  private getEndPoint(index: number, value: number, color: string) {
    return {
      symbol: 'none',
      data: [{
        coord: [index, value],
        value: Math.round(value / 10000) + ' 關ｬ',
        label: { show: true, position: 'right', color: color, fontWeight: 'bold' }
      }]
    };
  }

  private renderEmptyChart() {
    this.historyLineOption = { title: { text: '遲牙ｾ・丙謫壻ｸｭ...', left: 'center', top: '50%' } };
  }

  private renderAllocationChart(): void {
    const ctx = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (!ctx) return;
    const activeAssets = this.currentScenario.assets.filter(a => a.percentage > 0);
    this.allocationChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: activeAssets.map(a => `${a.type} ${a.percentage}%`),
        datasets: [{
          data: activeAssets.map(a => a.percentage),
          backgroundColor: activeAssets.map(a => a.color),
          borderColor: '#ffffff',
          borderWidth: 1,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private updateAllocationChart(): void {
    if (this.allocationChart) {
      const activeAssets = this.currentScenario.assets.filter(a => a.percentage > 0);
      this.allocationChart.data.labels = activeAssets.map(a => `${a.type} ${a.percentage}%`);
      this.allocationChart.data.datasets[0].data = activeAssets.map(a => a.percentage);
      this.allocationChart.data.datasets[0].backgroundColor = activeAssets.map(a => a.color);
      this.allocationChart.update();
    }
  }

  startSimulation() {
    // const userId = 1; // 蛛・ｨｭ ID
    const payload = {
      initialAmount: this.planParams[1].value * 10000,
      monthly: this.planParams[2].value,
      years: this.planParams[3].value,
      inflationRate: 0.02,//蝗ｺ螳・
      allocations: {
        STOCK: (this.currentScenario.assets.find(a => a.type === '閧｡逾ｨ')?.percentage || 0) / 100,
        BOND: (this.currentScenario.assets.find(a => a.type === '蛯ｵ蛻ｸ')?.percentage || 0) / 100,
        GOLD: (this.currentScenario.assets.find(a => a.type === '鮟・≡')?.percentage || 0) / 100,
        CASH: (this.currentScenario.assets.find(a => a.type === '迴ｾ驥・)?.percentage || 0) / 100,
      }
    };

    this.http.post<MonteResponse>(this.apiUrl, payload)
      .subscribe({
        next: (res) => {
          this.apiResult = res;
          console.log('讓｡謫ｬ謌仙粥・・, res);
          this.renderHistoryLineChart(res.trajectories);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('荳ｲ謗･螟ｱ謨・, err);
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.allocationChart?.resize();
  }
  //邂礼ｸｽ蜥・
  get totalPercent() {
    return this.currentScenario.assets.reduce((sum, asset) => sum + asset.percentage, 0);
  }

  /**
  * 隱ｿ謨ｴ貊第｡ｿ謨ｸ蛟ｼ
  * @param index planParams 逧・ｴ｢蠑・
  * @param step 隱ｿ謨ｴ逧・ｴ夊ｷ・(豁｣謨ｸ蠅槫刈・瑚ｲ謨ｸ貂帛ｰ・
  */
  adjustValue(index: number, step: number) {
    const param = this.planParams[index];
    const newValue = param.value + step;

    // 蜿門ｾ・input 逧・ｊ逡碁剞蛻ｶ (謌冶・ｽ逶ｴ謗･蟇ｫ豁ｻ)
    const min = index === 2 ? 1000 : 1;
    const max = index === 2 ? 100000 : 40;

    // 遒ｺ菫晄丙蛟ｼ蝨ｨ遽・恪蜈ｧ
    if (newValue >= min && newValue <= max) {
      param.value = newValue;
    }
  }

}
