import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule} from 'ngx-echarts';
import type { EChartsOption } from 'echarts';


@Component({
  standalone: true,
  selector: 'app-health',
  templateUrl: './health.component.html',
  imports: [CommonModule, NgxEchartsModule],
})
export class HealthComponent implements OnInit {

  constructor(private http: HttpClient) {}

  role: string = 'user';
  healthData: any;


   // ✅ 全部加型別（重點🔥）
  assetChartOption: EChartsOption = {};
  debtChartOption: EChartsOption = {};
  radarChartOption: EChartsOption = {};

  // ===== 圖表 =====
  gaugeOption: any;
  radarOption: any;
  historyLineOption: any;

  // ===== 指標 =====
  metrics: {
    [key: string]: {
      label: string;
      value: number;
      status: string;
      isAlert: boolean;
    }
  } = {};

  // ===== 方法 =====
  goRegister() {
    console.log('go register');
  }

  onChartClick(event: any) {
    console.log(event);
  }


  ngOnInit(): void {
    this.loadHealthData();
  }

  loadHealthData() {
    this.http.get<any>('http://localhost:8080/api/health/1')
      .subscribe(res => {
        console.log('🔥 API回來了:', res);
        this.healthData = res.data;

        this.initAssetChart();
        this.initDebtChart();
        this.initRadarChart();
      });
  }

  // =========================
  // 📊 資產圖
  // =========================
  initAssetChart() {

     const data: { name: string; value: number }[] =
    Object.entries(this.healthData?.assetDistribution || {})
      .map(([name, value]) => ({
        name,
        value: Number(value)
      }));

  this.assetChartOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      data
    }]
  };
}

  // =========================
  // 📊 負債圖
  // =========================
  initDebtChart() {

     const data: { name: string; value: number }[] =
      Object.entries(this.healthData?.debtDistribution ?? {})
        .map(([name, value]) => ({
          name,
          value: Number(value)
        }));

    this.debtChartOption = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        data
      }]
    };
  }

  // =========================
  // 📊 雷達圖（財務健康🔥）
  // =========================
  initRadarChart() {

    this.radarChartOption = {
      tooltip: {},
      radar: {
        indicator: [
          { name: '流動性', max: 6 },
          { name: '負債比', max: 100 },
          { name: '儲蓄率', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [
            this.healthData.liquidityRatio,
            100 - this.healthData.debtToIncome, // 轉成越高越好
            this.healthData.savingsRate
          ]
        }]
      }]
    };
  }
}


