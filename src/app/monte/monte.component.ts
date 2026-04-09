import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import * as echarts from 'echarts';
import { ChangeDetectorRef } from '@angular/core';

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
  imports: [CommonModule, FormsModule, NgxEchartsDirective],
  templateUrl: './monte.component.html',
  styleUrls: ['./monte.component.scss'],
  providers: [
    { provide: NGX_ECHARTS_CONFIG, useFactory: () => ({ echarts }) }
  ]
})
export class MonteComponent implements OnInit, AfterViewInit {
  historyLineOption: echarts.EChartsOption = {};
  private chartInstance: echarts.ECharts | undefined;

  userId = 1;
  apiUrl = `http://localhost:8080/api/monte/simulate/${this.userId}`;
  apiResult: MonteResponse | null = null;
  allocationChart: Chart<'pie'> | undefined;

  planParams = [
    { label: '目標金額', value: 160 },
    { label: '期初投入', value: 30 },
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
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
      text: '投資資產增長模擬',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      confine: true,
      trigger: 'axis',
      formatter: (params: any) => {
        let html = `<div><strong>第  ${params[0].name} 年</strong></div>`;
        params.forEach((p: any) => {
          if (p.seriesName !== '初始投入') {
            const formattedValue = Math.round(p.value).toLocaleString();
            html += '<div>' + p.marker + p.seriesName + ': ' + formattedValue + '</div>';
          }
        });
        return html;
      }
    },
    legend: { bottom: 0,data: ['投入本金', '較佳預期', '一般表現', '較差預期'] },
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
        bottom: '22%',
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
        data: data.map(d => d.cost),
        symbol: 'circle',
        smooth: true,
        markPoint: {
          symbol: 'none',
          data: [{
            coord: [data.length - 1, data[data.length - 1]!.confidenceHigh],
            value: Math.round(data[data.length - 1]!.confidenceHigh / 10000) + ' 萬',
            label: { show: true, position: 'right', color: '#67c23a', fontWeight: 'bold', formatter: '{c}' }
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
                color: '#3858cc',
                type: 'solid',
                width: 2
              }
            }
          ]
        }
      }
    ]as any,
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
    this.historyLineOption = { title: { text: '（等待數據中...）', left: 'center', top: '40%' } };
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
    const userId = 1; // 假設 ID
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

    this.http.post<MonteResponse>(`http://localhost:8080/api/monte/simulate/1`, payload)
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
}
