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



  // 險育ｮ礼ｵ先棡
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
  periods = ['1蛟区怦', '6蛟区怦', '1蟷ｴ', '3蟷ｴ'];
  selectedPeriod = '1蛟区怦';

  ngOnInit() {
    this.exampleService.user$.subscribe(user => {


      if (!user || !user.id) {
        console.log('險ｪ螳｢讓｡蠑・);

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

    // 荵句ｾ悟庄荳ｲ API
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
              formatter: '{b}<br/>謌宣聞邇・ｼ嘴c}%'
            },

            xAxis: {
              type: 'category',
              data: months
            },

            yAxis: {
              type: 'value',
              min: 'dataMin',
              max: 'dataMax',

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
          formatter: '{value} 蛻・,
          color: 'inherit',
          offsetCenter: [0, '75%'], // 蜷台ｸ狗ｧｻ蜍・
          fontSize: 30,
          fontWeight: 'bold'
        },
        data: [{ value: Math.round(score), name: '蛛･蠎ｷ蠕怜・' }],
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
          offsetCenter: [0, '40%'], //荳顔ｧｻ
          fontSize: 16,
          color: '#8c8c8c'
        },
      }]
    };
  }

  initRadar(L: number, DTI: number, S: number, date: string = '迴ｾ蝨ｨ') {
    this.radarOption = {
      title: {
        text: `${date} 雋｡蜍咏朽豕∝・譫秦,
        left: 'center',
        textStyle: { fontSize: 14 }
      },

      tooltip: {
        trigger: 'item'
      },
      radar: {
        radius: '60%',
        indicator: [
          { name: '豬・蜍・諤ｧ', max: 12 },
          { name: '謚・螢・諤ｧ\n \n(菴手ｲ蛯ｵ)', max: 100 },
          { name: '蜆ｲ 闢・蜉・, max: 100 },
          { name: '謚・雉・蜉・, max: 100 }
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
      console.warn('userId 荳榊ｭ伜惠・檎┌豕募叙蠕怜▼蠎ｷ雉・侭');
      return;
    }

    this.isLoading = true;

    this.healthService.getHealth(userId).subscribe({
      next: (res) => {

        const data = res;

        this.healthData = data;

        console.log('health data 痩', data);

        // 笨・遨ｺ迢諷区而蛻ｶ・域ｸ蠢・沐･・・
        this.hasAsset = (data.totalAssets ?? 0) > 0;
        this.hasLiability = (data.totalLiabilities ?? 0) > 0;

        const L = data.L ?? 0;
        const DTI = data.DTI ?? 0;
        const S = data.S ?? 0;

        const score = data.score ?? 0;

        this.analysisList = data.advice ?? [];

        if (score === 0) {

          this.healthLevel = '蜊ｱ讖・;

          this.healthLevelClass = 'crisis';

          this.analysisList = [
            '逶ｮ蜑崎ｲ｡蜍咏朽豕∝ｷｲ騾ｲ蜈･鬮倬｢ｨ髫ｪ蜊髢・,
            '蟒ｺ隴ｰ遶句叉髯堺ｽ手ｲ蛯ｵ闊・崋螳壽髪蜃ｺ',
            '蜆ｪ蜈亥ｻｺ遶狗ｷ頑･鬆仙ｙ驥・,
            '驕ｿ蜈埼ｫ倬｢ｨ髫ｪ謚戊ｳ・・鬘榊､門溯ｲｸ'
          ];

        }
        else if (score >= 85) {

          this.healthLevel = '髱槫ｸｸ蛛･蠎ｷ';

          this.healthLevelClass = 'excellent';

        }
        else if (score >= 60) {

          this.healthLevel = '遨ｩ螳・;

          this.healthLevelClass = 'good';

        }
        else if (score >= 40) {

          this.healthLevel = '豕ｨ諢・;

          this.healthLevelClass = 'warning';

        }
        else {

          this.healthLevel = '隴ｦ蜻・;

          this.healthLevelClass = 'danger';

        }


        this.healthTipText =
          '90~100・夊ｲ｡蜍咎撼蟶ｸ蛛･蠎ｷ\n' +
          '60~89・夊ｲ｡蜍咏ｩｩ螳喀n' +
          '50~59・夐怙豕ｨ諢乗髪蜃ｺ\n' +
          '0~49・夊ｲ｡蜍咎｢ｨ髫ｪ蛛城ｫ・;


        // 櫨 譖ｴ譁ｰ逡ｫ髱｢
        this.metrics = {
          liquidity: {
            label: '邱頑･鬆仙ｙ驥・,
            value: L.toFixed(1) + ' 蛟区怦',
            isAlert: L < 6,
            status: '',
            tip: '縲梧ｯ乗怦蠢・ｦ∵髪蜃ｺ縲更 6蛟区怦・碁咏ｭ・犬蠢・域弍髫ｨ譎ょ庄蜍慕畑逧・樟驥・
          },
          debt: {
            label: '雋蛯ｵ豈・,
            value: DTI.toFixed(1) + '%',
            isAlert: DTI > 70,
            status: '',
            tip: '雋蛯ｵ豈・= 邵ｽ雋蛯ｵ / 謾ｶ蜈･ ﾃ・100%・悟ｻｺ隴ｰ菴取名30%'
          },
          savings: {
            label: '蜆ｲ闢・紫',
            value: S.toFixed(1) + '%',
            isAlert: S < 20,
            status: '',
            tip: '(豈乗怦蜆ｲ闢・ﾃｷ 豈乗怦謾ｶ蜈･)X100%・御ｸ榊ｽｱ髻ｿ逕滓ｴｻ蜩∬ｳｪ蜑肴署荳具ｼ悟┫闢・紫諢磯ｫ俶ц螂ｽ'
          },
        };

        // 櫨 譖ｴ譁ｰ蝨冶｡ｨ
        this.initGauge(score);
        this.initRadar(L, DTI, S,);

        this.isLoading = false; // 笨・邨先據 loading

      },
      error: (err) => {
        console.error('蜿門ｾ怜▼蠎ｷ雉・侭螟ｱ謨・, err);
        this.isLoading = false;
      }
    });
  }

}

