import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { ExampleService } from '../@service/example.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../@service/health.service';


interface HealthMetric {
  label: string;
  value: string;
  isAlert: boolean;
  status: string;
}

interface MetricsMap {
  [key: string]: HealthMetric;
}

interface HealthResponse {
  L: number;
  DTI: number;
  S: number;
  G: number;
  score: number;
  level?: string;
  advice?: string;
}

interface HistoryItem {
  date: string;
  L: number;
  DTI: number;
  S: number;
  G: number;
  score: number;
}

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, FormsModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss'
})
export class HealthComponent implements OnInit {

  role!: string;
  constructor(
    private router: Router,
    private exampleService: ExampleService
    private healthService: HealthService
  ) { }

  goRegister() {
    this.router.navigate(['/register']);
  }

  // 模擬資料
  rawInfo = {
    income: 100000,
    expense: 40000,
    assets: { savings: 200000, cash: 40000 },
    debts: { mortgage: 20000, carLoan: 5000, personalLoan: 0, creditCard: 3000 },
    investmentSuccessRate: 85

  };

  metrics: MetricsMap = {
    liquidity: { label: '', value: '', isAlert: false, status: '' },
    debt: { label: '', value: '', isAlert: false, status: '' },
    savings: { label: '', value: '', isAlert: false, status: '' },
    investment: { label: '', value: '', isAlert: false, status: '' }
  };

  gaugeOption: EChartsOption = {};
  radarOption: EChartsOption = {};
  historyLineOption: EChartsOption = {};

  // 假設這是你的詳細數據
  historyData = [
    { date: '2026-01', L: 6, DTI: 50, S: 70, G: 65, score: 50 }, // 1月
    { date: '2026-02', L: 7.5, DTI: 60, S: 80, G: 70, score: 65 }, // 2月
    { date: '2026-03', L: 8.5, DTI: 70, S: 90, G: 80, score: 80 }  // 3月 (目前)
  ];

  historyLineOption: any;

  ngOnInit() {
    this.exampleService.user$.subscribe(user => {
      this.role = user.role; // 當角色改變，這裡會自動觸發
      // this.userId = user.id;
      // this.userName = user.name;
    });
    this.calculateFinancialHealth();
  }
  private getScore(L: number, DTI: number, S: number, G: number): number {
    const hasGoal = G !== null && G !== undefined && G > 0;
    const baseWeight = hasGoal ? (100 / 3 / 1.2) : (100 / 3);
    const investWeight = hasGoal ? 20 / 1.2 : 0;

    const scoreL = Math.min(baseWeight, (L / 6) * baseWeight);
    const scoreDTI = Math.min(baseWeight, (Math.max(0, 50 - DTI) / 50) * baseWeight);
    const scoreS = Math.min(baseWeight, (S / 20) * baseWeight);
    const scoreG = hasGoal ? Math.min(investWeight, (G / 100) * investWeight) : 0;


    return Math.round(scoreL + scoreDTI + scoreS + scoreG);
  }

  loadHealthData(): void {
    this.healthService.postHealth({
      income: 100000,
      expense: 40000,
      savings: 200000,
      cash: 40000,
      mortgage: 20000,
      carLoan: 5000,
      personalLoan: 0,
      creditCard: 3000,
      investmentSuccessRate: 85
    }).subscribe({
      next: (res: HealthResponse) => {
        console.log('後端回來', res);

        this.initGauge(res.score);
        this.initRadar(res.L, res.DTI, res.S, res.G);
        this.initHistoryLine(this.historyData);

        this.metrics = {
          liquidity: {
            label: '流動性',
            value: res.L.toFixed(1),
            isAlert: res.L < 3,
            status: res.L >= 6 ? '良好' : '偏低'
          },
          debt: {
            label: '負債比',
            value: res.DTI.toFixed(1) + '%',
            isAlert: res.DTI > 50,
            status: res.DTI < 50 ? '正常' : '過高'
          },
          savings: {
            label: '儲蓄率',
            value: res.S.toFixed(1) + '%',
            isAlert: res.S < 20,
            status: res.S >= 20 ? '正常' : '偏低'
          },
          investment: {
            label: '投資成功率',
            value: res.G.toFixed(1) + '%',
            isAlert: res.G < 60,
            status: res.G >= 60 ? '良好' : '需改善'
          }

        },
        axisTick: { show: false },
        axisLabel: {
          distance: 20,
          color: '#999',
          fontSize: 12
        },



        title: {
          offsetCenter: [0, '40%'], //上移
          fontSize: 16,
          color: '#8c8c8c'
        },
      }]

    };
  }

  initRadar(L: number, DTI: number, S: number, G: number, date: string = '現在'): void {
    this.radarOption = {
      title: {
        text: `${date} 財務狀況分析`,
        left: 'center',
        textStyle: { fontSize: 14 }
      },

      tooltip: {
        trigger: 'item'
      },
      radar: {
        radius: '60%',
        indicator: [
          { name: '流動性', max: 12 },
          { name: '抗壓性', max: 100 },
          { name: '儲蓄率', max: 100 },
          { name: '投資力', max: 100 }
        ]
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [L, 100 - DTI, S, G],
              areaStyle: { color: 'rgba(115, 209, 61, 0.3)' }
            }
          ]
        }
      ]
    };
  }

  initHistoryLine(data: HistoryItem[]): void {
    if (!data || data.length === 0) {
      return;
    }

    this.historyData = data;

    this.historyLineOption = {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['財務總分']
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.historyData.map(item => item.date),
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '總分'
      },

      //數據列
      series: [{
        name: '財務總分',
        type: 'line',
        data: this.historyData.map(item => item.score),
        smooth: true,
        symbolSize: 10,
        triggerLineEvent: true,
        lineStyle: {
          width: 4,
          color: '#5470c6'
        },
        areaStyle: {
          opacity: 0.2

        }
      ]
    };


    const last = this.historyData[this.historyData.length - 1];
    if (last) {
      this.initRadar(last.L, last.DTI, last.S, last.G, last.date);
    }
  }

  onChartClick(params: any): void {
    const index = params?.dataIndex;

    const last = this.historyData[this.historyData.length - 1];
    if (last) {
      this.initRadar(last.L, last.DTI, last.S, last.G);
    }
  }
}
