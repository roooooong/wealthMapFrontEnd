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
    { label: '目標金額', value: 100 },
    { label: '期初投入', value: 10 },
    { label: '每月投入', value: 10000 },
    { label: '年期', value: 10 }
  ];

  currentScenario: SimulationScenario = {
    id: 1,
    name: '基礎配置',
    assets: [
      { type: '股票', percentage: 35, color: '#85c1e9' },
      { type: '債券', percentage: 65, color: '#f9e79f' },
      { type: '黃金', percentage: 0, color: '#f5c6cb' },
      { type: '現金', percentage: 0, color: '#d1e7dd' }
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
    const user = this.exampleService.currentUser; // 💡 拿快照
    console.log(this.exampleService.currentUser);
    // 情況 A：已經有登入資料了 (從其他頁面過來)
    if (user && user.id !== 0) {
      this.userId = user.id;
      this.role = user.role;
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
        text: '投資資產成長模擬',
        left: 'center',
        top: '5%', // 稍微留白
        textStyle: {
          fontSize: 16,           // 放大一點點
          // color: '#033270',       // 使用你的 UI 深藍色
          fontFamily: 'sans-serif'
        },

      },
      // tooltip: {
      //   confine: true,
      //   trigger: 'axis',
      //   formatter: (params: any) => {
      //     let html = `<div><strong>第  ${params[0].name} 年</strong></div>`;
      //     params.forEach((p: any) => {
      //       if (p.seriesName !== '初始投入') {
      //         const formattedValue = Math.round(p.value).toLocaleString();
      //         html += '<div>' + p.marker + p.seriesName + ': ' + formattedValue + '</div>';
      //       }
      //     });
      //     return html;
      //   }
      // },
      tooltip: {
        // 樣式設定
        backgroundColor: 'rgba(255, 255, 255, 0.98)', // 純白背景
        borderColor: '#4091c9',                       // 藍色邊框
        borderWidth: 1,
        padding: 12,                                  // 內距
        borderRadius: 15,                             // 圓角 (ECharts 屬名為 borderRadius)
        textStyle: {
          color: '#666',                              // 內文顏色
          fontSize: 14
        },
        confine: true,
        trigger: 'axis',
        formatter: (params: any) => {
          // 標題部分：對應 titleColor: '#333'
          let html = `<div style="color: #333; font-weight: bold; margin-bottom: 8px;">第 ${params[0].name} 年</div>`;

          params.forEach((p: any) => {
            if (p.seriesName !== '初始投入') {
              // 數值處理：使用你原本的格式化方式
              const formattedValue = Math.round(p.value).toLocaleString();

              // 列表項目樣式
              html += `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 4px 0;">
            <span style="display: flex; align-items: center;">
              ${p.marker} <!-- ECharts 自動生成的圓點 -->
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
      legend: { bottom: 0, data: ['投入本金', '較佳預期', '一般表現', '較差預期'] },
      grid: {
        left: '5%',
        right: '15%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '年',
        boundaryGap: false,
        data: years,
        axisLine: { show: true }
      },
      yAxis: {
        type: 'value',
        name: '金額',
        axisLine: { show: true },
        axisTick: { show: true },

        axisLabel: {
          formatter: (value: number) => {
            return (value / 10000).toFixed(0) + ' 萬';
          }
        }
      },
      graphic: [
        {
          type: 'text',
          left: '20%',
          bottom: '18%',
          style: {
            text: ` 初  始  投  入  ${Math.round(data[0].cost / 10000)}  萬`,
            font: 'bold 16px sans-serif',
            fill: '#666'
          }
        }
      ],
      series: [
        {
          name: '初始投入',
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
          name: '投入本金',
          type: 'line',
          data: data.map(d => d.cost), itemStyle: { color: '#4091C9' },
          symbol: 'circle',
          smooth: true,
          markPoint: {
            symbol: 'none',
            data: [{
              coord: [data.length - 1, data[data.length - 1]!.confidenceHigh],
              value: Math.round(data[data.length - 1]!.confidenceHigh / 10000) + ' 萬',
              label: { show: true, position: 'right', color: '#4091C9', fontWeight: 'bold', formatter: '{c}' }
            }]
          }
        },
        {
          name: '較佳預期',
          type: 'line',
          data: data.map(d => d.confidenceHigh),
          itemStyle: { color: '#67c23a' },
          symbol: 'none',
          smooth: true
        },
        {
          name: '一般表現',
          type: 'line',
          data: data.map(d => d.val),
          itemStyle: { color: '#f5b041' },
          symbol: 'none',
          smooth: true
        },
        {
          name: '較差預期',
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
                  formatter: (params: any) => `目標金額\n \n ${params.value / 10000} 萬`,
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
        value: Math.round(value / 10000) + ' 萬',
        label: { show: true, position: 'right', color: color, fontWeight: 'bold' }
      }]
    };
  }

  private renderEmptyChart() {
    this.historyLineOption = { title: { text: '等待數據中...', left: 'center', top: '50%' } };
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
    // const userId = 1; // 假設 ID
    const payload = {
      initialAmount: this.planParams[1].value * 10000,
      monthly: this.planParams[2].value,
      years: this.planParams[3].value,
      inflationRate: 0.02,//固定
      allocations: {
        STOCK: (this.currentScenario.assets.find(a => a.type === '股票')?.percentage || 0) / 100,
        BOND: (this.currentScenario.assets.find(a => a.type === '債券')?.percentage || 0) / 100,
        GOLD: (this.currentScenario.assets.find(a => a.type === '黃金')?.percentage || 0) / 100,
        CASH: (this.currentScenario.assets.find(a => a.type === '現金')?.percentage || 0) / 100,
      }
    };

    this.http.post<MonteResponse>(this.apiUrl, payload)
      .subscribe({
        next: (res) => {
          this.apiResult = res;
          console.log('模擬成功！', res);
          this.renderHistoryLineChart(res.trajectories);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('串接失敗', err);
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.allocationChart?.resize();
  }
  //算總和
  get totalPercent() {
    return this.currentScenario.assets.reduce((sum, asset) => sum + asset.percentage, 0);
  }

  /**
  * 調整滑桿數值
  * @param index planParams 的索引
  * @param step 調整的級距 (正數增加，負數減少)
  */
  adjustValue(index: number, step: number) {
    const param = this.planParams[index];
    const newValue = param.value + step;

    // 取得 input 的邊界限制 (或者你直接寫死)
    const min = index === 2 ? 1000 : 1;
    const max = index === 2 ? 100000 : 40;

    // 確保數值在範圍內
    if (newValue >= min && newValue <= max) {
      param.value = newValue;
    }
  }

}
