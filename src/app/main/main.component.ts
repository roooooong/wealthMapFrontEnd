import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  role: string = "user";

  constructor(private router: Router) { }

  goToRiskTest() {
    this.router.navigate(['/risk-test']);
  }

  closeNotice() {
    const notice = document.getElementById('notification');
    notice?.remove();
  }

  ngAfterViewInit() {
    let ctx = document.getElementById('chart') as HTMLCanvasElement;

    let data = {
      labels: ['現金', '股票', '基金', '債券'],
      datasets: [
        {
          label: '金額',
          data: [1000000, 1350000, 800000, 650000],
          backgroundColor: [
            '#FFF7AE',
            '#99B3E4',
            '#bdffe0',
            '#fbb6c9',
          ],

          hoverOffset: 4,
        },
      ],
    };

    // 創建圖表
    let chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 40
        },
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 40,
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }
}