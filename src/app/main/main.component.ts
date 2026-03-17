import { Component } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  // 三種身分 visitor;user;admin
  role: string = "user";

  closeNotice() {
    const notice = document.getElementById('notification');
    notice?.remove();
  }

  ngAfterViewInit() {
    // 獲取 canvas 元素
    let ctx = document.getElementById('chart') as HTMLCanvasElement;

    // 設定數據
    let data = {
      // x 軸文字
      labels: ['現金', '股票','基金','債券'],
      datasets: [
        {
          // 上方分類文字
          label: '金額',
          // 數據
          data: [1000000,1350000,800000,650000],
          // 線與邊框顏色
          backgroundColor: [
            '#FFF7AE',
            '#99B3E4',
            '#bdffe0',
            '#fbb6c9',
          ],
          //設定hover時的偏移量，滑鼠移上去表會偏移，方便觀看選種的項目
          hoverOffset: 4,
        },
      ],
    };

    // 創建圖表
    let chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,           // 讓圖表隨容器大小伸縮
        maintainAspectRatio: false,  // 設為 false，圖表才會完全聽從 CSS 設定的高度
        layout: {
          padding: 40               // 💡 增加內距，圖表視覺上會直接縮小
        },
        plugins: {
          legend: {
            position: 'right',  // 💡 關鍵：設定在右邊
            align: 'center',    // 圖例在右側垂直置中
            labels: {
              boxWidth: 40,     // 圖例色塊的大小
              padding: 15,
              // 每個圖例之間的間距
              font: {
                size: 12        // 文字大小
              }
            }
          }
        }
      }
    });
  }
}

