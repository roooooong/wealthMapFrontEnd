import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { ExampleService } from '../@service/example.service';
import { Router } from '@angular/router';
import { HealthService } from '../services/health.service';
import { MatTooltipModule } from '@angular/material/tooltip';


interface HealthMetric {
  label: string;
  value: string;
  isAlert: boolean;
  status: string;
  tip: string;
}
interface MetricsMap {
  [key: string]: HealthMetric;
  liquidity: HealthMetric;
  debt: HealthMetric;
  savings: HealthMetric;
  investment: HealthMetric;
}



@Component({
  selector: 'app-health',
  imports: [
    CommonModule,
    NgxEchartsDirective,
    MatTooltipModule
  ],
  providers: [
    provideEchartsCore({ echarts })
  ],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss'
})


export class HealthComponent implements OnInit {
  userId: number | null = null;
  role!: string;
  constructor(
    private router: Router,
    private exampleService: ExampleService,
    private healthService: HealthService
  ) { }

  goRegister() {
    this.router.navigate(['/register']);
  }


  // 計算結果
  metrics: MetricsMap = {
    liquidity: { label: '', value: '', isAlert: false, status: '', tip: '' },
    debt: { label: '', value: '', isAlert: false, status: '', tip: '' },
    savings: { label: '', value: '', isAlert: false, status: '', tip: '' },
    investment: { label: '', value: '', isAlert: false, status: '', tip: '' },
  };

  gaugeOption: EChartsOption = {};
  radarOption: EChartsOption = {};


  historyLineOption: any = {};
  healthData: any = null;
  analysisList: string[] = [];

  isLoading: boolean = false;
  hasAsset: boolean = false;
  hasLiability: boolean = false;


  ngOnInit() {
    this.exampleService.user$.subscribe(user => {


      if (!user || !user.id) {
        console.log('訪客模式');

        this.role = 'visitor';

        return;
      }
      this.role = user.role;
      this.userId = user.id;

      if (this.userId) {
        this.fetchHealthData(this.userId);
      }
    });
  }

  radarChartOption = {
    radar: {
      indicator: [
        { name: '日常收支', max: 100 },
        { name: '風險抵抗', max: 100 },
        { name: '財務規劃', max: 100 },
        { name: '財務信心', max: 100 },
        { name: '心理滿足', max: 100 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [80, 75, 60, 65, 70],
            areaStyle: { opacity: 0.3 }
          }
        ]
      }
    ]
  };


  initGauge(score: number) {
    this.gaugeOption = {
      series: [{
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 5,
        detail: {
          valueAnimation: true,
          formatter: '{value} 分',
          color: 'inherit',
          offsetCenter: [0, '75%'], // 向下移動
          fontSize: 30,
          fontWeight: 'bold'
        },
        data: [{ value: Math.round(score), name: '健康得分' }],
        axisLine: {
          lineStyle: {
            width: 15,
            color: [[0.3, '#ef3c2d'], [0.7, '#9dcee2'], [1, '#4091c9']]
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

  initRadar(L: number, DTI: number, S: number, G: number, date: string = '現在') {
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
          { name: '流 動 性', max: 12 },
          { name: '抗 壓 性\n \n(低負債)', max: 100 },
          { name: '儲 蓄 力', max: 100 },
          { name: '投 資 力', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [L, 100 - DTI, S, G],
          areaStyle: { color: 'rgba(115, 209, 61, 0.3)' }
        }]
      }]
    };
  }


  fetchHealthData(userId: number) {

    if (!userId) {
      console.warn('userId 不存在，無法取得健康資料');
      return;
    }

    this.isLoading = true;

    this.healthService.getHealth(userId).subscribe({
      next: (res) => {

        const data = res.data; // AppResponse 包裝

        this.analysisList = data.advice ?? [];
        console.log('health data 👉', data);

        // ✅ 空狀態控制（核心🔥）
        this.hasAsset = (data.totalAssets ?? 0) > 0;
        this.hasLiability = (data.totalLiabilities ?? 0) > 0;

        const L = data.L ?? 0;
        const DTI = data.DTI ?? 0;
        const S = data.S ?? 0;
        const G = data.G ?? 0;
        const score = data.score ?? 0;

        // 🔥 更新畫面
        this.metrics = {
          liquidity: {
            label: '緊急預備金',
            value: L.toFixed(1) + ' 個月',
            isAlert: L < 6,
            status: '',
            tip: '建議至少6個月生活費'
          },
          debt: {
            label: '負債比',
            value: DTI.toFixed(1) + '%',
            isAlert: DTI > 30,
            status: '',
            tip: '負債比 = 總負債 / 收入 × 100%，建議低於30%'
          },
          savings: {
            label: '儲蓄率',
            value: S.toFixed(1) + '%',
            isAlert: S < 20,
            status: '',
            tip: '建議至少20%以上'
          },
          investment: {
            label: '理財成就率',
            value: G + '%',
            isAlert: G < 80,
            status: '',
            tip: '衡量投資達標程度'
          }
        };

        // 🔥 更新圖表
        this.initGauge(score);
        this.initRadar(L, DTI, S, G);

        this.isLoading = false; // ✅ 結束 loading

      },
      error: (err) => {
        console.error('取得健康資料失敗', err);
        this.isLoading = false;
      }
    });
  }

}

