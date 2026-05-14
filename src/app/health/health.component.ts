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
    private healthService: HealthService,
  ) { }

  goRegister() {
    this.router.navigate(['/register']);
  }



  // 計算結果
  metrics: MetricsMap = {
    liquidity: { label: '', value: '', isAlert: false, status: '', tip: '' },
    debt: { label: '', value: '', isAlert: false, status: '', tip: '' },
    savings: { label: '', value: '', isAlert: false, status: '', tip: '' },
  };

  gaugeOption: EChartsOption = {};
  radarOption: EChartsOption = {};

  healthLevel: string = '';
  healthTipText: string = '';
  historyLineOption: any = {};
  healthData: any = null;
  analysisList: string[] = [];

  healthLevelClass: string = '';
  isLoading: boolean = false;
  hasAsset: boolean = false;
  hasLiability: boolean = false;
  trendOption: any;
  periods = ['1個月', '6個月', '1年', '3年'];
  selectedPeriod = '1個月';

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

        this.loadGrowthChart();
      }
    });

  }



  changePeriod(period: string) {

    this.selectedPeriod = period;

    // 之後可串 API
    this.loadGrowthChart();

  }

  loadGrowthChart() {

    this.healthService
      .getAssetGrowth(this.userId!)
      .subscribe({

        next: (res) => {

          const months =
            res.map(item => item.month);

          const growthRates =
            res.map(item => item.growthRate);

          this.trendOption = {

            tooltip: {
              trigger: 'axis',
              formatter: '{b}<br/>成長率：{c}%'
            },

            xAxis: {
              type: 'category',
              data: months
            },

            yAxis: {
              type: 'value',

              min: -100,
              max: 100,

              interval: 20,

              axisLabel: {
                formatter: '{value}%'
              },

              splitLine: {
                lineStyle: {
                  color: '#e5e7eb'
                }
              }
            },

            series: [
              {
                data: growthRates,

                type: 'line',

                smooth: false,

                symbol: 'circle',

                symbolSize: 10,

                lineStyle: {
                  width: 5,
                  color: '#4091C9'
                },

                itemStyle: {
                  color: '#fff',
                  borderColor: '#4091C9',
                  borderWidth: 3
                }
              }
            ]
          };

        }

      });

  }

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

  initRadar(L: number, DTI: number, S: number, date: string = '現在') {
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
          value: [L, 100 - DTI, S],
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

        const data = res;

        this.healthData = data;

        console.log('health data 👉', data);

        // ✅ 空狀態控制（核心🔥）
        this.hasAsset = (data.totalAssets ?? 0) > 0;
        this.hasLiability = (data.totalLiabilities ?? 0) > 0;

        const L = data.L ?? 0;
        const DTI = data.DTI ?? 0;
        const S = data.S ?? 0;

        const score = data.score ?? 0;

        this.analysisList = data.advice ?? [];

        if (score === 0) {

          this.healthLevel = '危機';

          this.healthLevelClass = 'crisis';

          this.analysisList = [
            '目前財務狀況已進入高風險區間',
            '建議立即降低負債與固定支出',
            '優先建立緊急預備金',
            '避免高風險投資與額外借貸'
          ];

        }
        else if (score >= 85) {

          this.healthLevel = '非常健康';

          this.healthLevelClass = 'excellent';

        }
        else if (score >= 60) {

          this.healthLevel = '穩定';

          this.healthLevelClass = 'good';

        }
        else if (score >= 40) {

          this.healthLevel = '注意';

          this.healthLevelClass = 'warning';

        }
        else {

          this.healthLevel = '警告';

          this.healthLevelClass = 'danger';

        }


        this.healthTipText =
          '90~100：財務非常健康\n' +
          '60~89：財務穩定\n' +
          '50~59：需注意支出\n' +
          '0~49：財務風險偏高';


        // 🔥 更新畫面
        this.metrics = {
          liquidity: {
            label: '緊急預備金',
            value: L.toFixed(1) + ' 個月',
            isAlert: L < 6,
            status: '',
            tip: '「每月必要支出」X 6個月，這筆錢必須是隨時可動用的現金'
          },
          debt: {
            label: '負債比',
            value: DTI.toFixed(1) + '%',
            isAlert: DTI > 70,
            status: '',
            tip: '負債比 = 總負債 / 收入 × 100%，建議低於30%'
          },
          savings: {
            label: '儲蓄率',
            value: S.toFixed(1) + '%',
            isAlert: S < 20,
            status: '',
            tip: '(每月儲蓄 ÷ 每月收入)X100%，不影響生活品質前提下，儲蓄率愈高愈好'
          },
        };

        // 🔥 更新圖表
        this.initGauge(score);
        this.initRadar(L, DTI, S,);

        this.isLoading = false; // ✅ 結束 loading

      },
      error: (err) => {
        console.error('取得健康資料失敗', err);
        this.isLoading = false;
      }
    });
  }

}

