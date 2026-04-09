import { Component,signal } from '@angular/core';
import { StrategyListComponent } from '../strategy-list/strategy-list.component';
import { ExampleService } from '../@service/example.service';

@Component({
  selector: 'app-investment-manage',
  imports: [StrategyListComponent],
  templateUrl: './investment-manage.component.html',
  styleUrl: './investment-manage.component.scss'
})
export class InvestmentManageComponent {
  constructor(
    private exampleService: ExampleService
  ) {}
  // 定義目前的頁籤狀態，預設為 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('strategy');

  // 三種身分 visitor;user;admin
  role!: string ;
  userId!:number;
  userName!:string;

  // 切換頁籤的方法
  switchTab(tab: 'rebalance' | 'strategy' | 'engine') {
    this.currentTab.set(tab);
  }

  ngOnInit(): void {
    this.exampleService.role$.subscribe(role => {
      this.role = role; // 當角色改變，這裡會自動觸發
    });
    this.exampleService.user$.subscribe(user => {
      this.role = user.role; // 當角色改變，這裡會自動觸發
      this.userId = user.id;
      this.userName = user.name;
    });
  }
}
