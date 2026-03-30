import { Component,signal } from '@angular/core';
import { StrategyListComponent } from '../strategy-list/strategy-list.component';

@Component({
  selector: 'app-investment-manage',
  imports: [StrategyListComponent],
  templateUrl: './investment-manage.component.html',
  styleUrl: './investment-manage.component.scss'
})
export class InvestmentManageComponent {
  // 定義目前的頁籤狀態，預設為 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('strategy');
  // 三種身分 visitor;user;admin
  role: string = "user";
  UserName:string ="User";

  // 切換頁籤的方法
  switchTab(tab: 'rebalance' | 'strategy' | 'engine') {
    this.currentTab.set(tab);
  }
}
