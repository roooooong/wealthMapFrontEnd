import { Component, signal, OnInit } from '@angular/core';
import { StrategyListComponent } from '../strategy-list/strategy-list.component';
import { MonteComponent } from '../monte/monte.component';
import { ExampleService } from '../@service/example.service';
import { Router } from '@angular/router';
import { Rebalance } from '../rebalance/rebalance';

@Component({
  selector: 'app-investment-manage',
  imports: [ StrategyListComponent,MonteComponent,Rebalance],
  templateUrl: './investment-manage.component.html',
  styleUrl: './investment-manage.component.scss'
})
export class InvestmentManageComponent{
  constructor(
    private router: Router,
    private exampleService: ExampleService
  ) { }
  // 定義目前的頁籤狀態，預設為 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('rebalance');

  // 三種身分 visitor;user;admin
  role!: string;
  userId!: number;
  userName!: string;

  //去註冊
  goRegister() {
    this.router.navigate(['/register']);
  }

  // 切換頁籤的方法
  switchTab(tab: 'rebalance' | 'strategy' | 'engine') {
    this.currentTab.set(tab);
  }

  ngOnInit(): void {
    // this.exampleService.role$.subscribe(role => {
    //   this.role = role; // 當角色改變，這裡會自動觸發
    // });
    this.exampleService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.role = user.role;
        this.userId = user.id;
        this.userName = user.name;
      }
    });
  }
}
