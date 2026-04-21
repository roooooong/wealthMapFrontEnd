import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 💡 為了讓 HTML 能用 *ngIf 切換
import { StrategyListComponent } from '../strategy-list/strategy-list.component';
import { ExampleService } from '../@service/example.service';
// 💡 這是妳要多加的新成員
import { Rebalance } from '../rebalance/rebalance';

@Component({
  selector: 'app-investment-manage',
  standalone: true,
  imports: [
    CommonModule,          // 💡 多加這一個 (工具包)
    StrategyListComponent, // 原本的
    Rebalance  // 💡 多加這一個 (新元件)
  ],
  templateUrl: './investment-manage.component.html',
  styleUrl: './investment-manage.component.scss'
})
export class InvestmentManageComponent implements OnInit {
  constructor(
    private exampleService: ExampleService
  ) {}

  // 定義目前的頁籤狀態，預設為 'strategy'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('rebalance');

  role!: string;
  userId!: number;
  userName!: string;

  // 切換頁籤的方法
  switchTab(tab: 'rebalance' | 'strategy' | 'engine') {
    this.currentTab.set(tab);
  }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.role = user.role;
        this.userId = user.id;
        this.userName = user.name;
      }
    });
  }
}
