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
  // 螳夂ｾｩ逶ｮ蜑咲噪鬆∫ｱ､迢諷具ｼ碁占ｨｭ轤ｺ 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('rebalance');

  // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
  role!: string;
  userId!: number;
  userName!: string;

  //蜴ｻ險ｻ蜀・
  goRegister() {
    this.router.navigate(['/register']);
  }

  // 蛻・鋤鬆∫ｱ､逧・婿豕・
  switchTab(tab: 'rebalance' | 'strategy' | 'engine') {
    this.currentTab.set(tab);
  }

  ngOnInit(): void {
    // this.exampleService.role$.subscribe(role => {
    //   this.role = role; // 逡ｶ隗定牡謾ｹ隶奇ｼ碁呵｣｡譛・・蜍戊ｧｸ逋ｼ
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
