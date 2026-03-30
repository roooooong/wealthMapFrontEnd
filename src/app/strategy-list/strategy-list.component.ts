import { Component, signal } from '@angular/core';
import { StrategySetting } from '../@interface/wealth-map';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-strategy-list',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './strategy-list.component.html',
  styleUrl: './strategy-list.component.scss'
})
export class StrategyListComponent {
  // 定義目前的頁籤狀態，預設為 'rebalance'
  currentTab = signal<'rebalance' | 'strategy' | 'engine'>('strategy');
  // 三種身分 visitor;user;admin
  role: string = "user";
  UserName:string ="User";
  showModal: boolean = true;
  strategies!:StrategySetting[];


  addStrategy(){

  }

  toggleActive(symbol:string){

  }
  onDeleteMode(){

  }
}
