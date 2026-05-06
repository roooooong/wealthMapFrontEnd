import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CashFlowService } from '../../services/cash-flow.service';
import { CashFlow } from '../../model/cash-flow.model';
import { ExampleService } from '../../../../@service/example.service';

@Component({
  selector: 'app-cash-flow-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-flow-overview.component.html',
  styleUrls: ['./cash-flow-overview.component.scss']
})
export class CashFlowOverviewComponent implements OnInit {

  cashFlows: CashFlow[] = [];
  currentUserId: number = 0;

  showAddForm: boolean = false;
  editingId: number | null = null; // 編輯模式用

  newType: 'INCOME' | 'EXPENSE' = 'INCOME';
  newCategory: string = '';
  newAmount: number | null = null;
  newDescription: string = '';
  newRecordDate: string = '';

  totalIncome: number = 0;
  totalExpense: number = 0;
  netAmount: number = 0;

  constructor(
    private cashFlowService: CashFlowService,
    private exampleService: ExampleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.cashFlowService.getHistory(this.currentUserId).subscribe({
      next: (res: any) => {
        this.cashFlows = Array.isArray(res) ? res : (res.data ?? []);
        this.calculateSummary();
      },
      error: (err) => console.error('抓取收支失敗', err)
    });
  }

  calculateSummary(): void {
    this.totalIncome = this.cashFlows
      .filter(cf => cf.type === 'INCOME')
      .reduce((sum, cf) => sum + cf.amount, 0);
    this.totalExpense = this.cashFlows
      .filter(cf => cf.type === 'EXPENSE')
      .reduce((sum, cf) => sum + cf.amount, 0);
    this.netAmount = this.totalIncome - this.totalExpense;
  }

  // 點編輯按鈕：帶入資料並開啟表單
  editCashFlow(cf: CashFlow): void {
    this.editingId = cf.id!;
    this.showAddForm = true;
    this.newType = cf.type as 'INCOME' | 'EXPENSE';
    this.newCategory = cf.category;
    this.newAmount = cf.amount;
    this.newDescription = cf.description ?? '';
    this.newRecordDate = cf.recordDate;
  }

  // 新增 or 修改統一入口
  submitForm(): void {
    if (!this.newCategory || !this.newAmount || !this.newRecordDate) {
      alert('請填寫完整資訊');
      return;
    }

    const payload: CashFlow = {
      userId: this.currentUserId,
      type: this.newType,
      category: this.newCategory,
      amount: Number(this.newAmount),
      description: this.newDescription,
      recordDate: this.newRecordDate
    };

    if (this.editingId) {
      // 修改模式
      this.cashFlowService.updateRecord(this.editingId, payload).subscribe({
        next: () => { this.cancelForm(); this.loadData(); },
        error: () => alert('修改失敗')
      });
    } else {
      // 新增模式
      this.cashFlowService.addRecord(payload).subscribe({
        next: () => { this.cancelForm(); this.loadData(); },
        error: () => alert('新增失敗')
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingId = null;
    this.newType = 'INCOME';
    this.newCategory = '';
    this.newAmount = null;
    this.newDescription = '';
    this.newRecordDate = '';
  }

  deleteCashFlow(id: number): void {
    if (confirm('確定刪除這筆收支紀錄？')) {
      this.cashFlowService.deleteRecord(id).subscribe({
        next: () => this.loadData(),
        error: () => alert('刪除失敗')
      });
    }
  }

  // 分欄用的 getter
  get incomeList(): CashFlow[] {
    return this.cashFlows.filter(cf => cf.type === 'INCOME');
  }

  get expenseList(): CashFlow[] {
    return this.cashFlows.filter(cf => cf.type === 'EXPENSE');
  }

  backToAsset(): void {
    this.router.navigate(['/assets']);
  }

  translateType(type: string): string {
    return type === 'INCOME' ? '收入' : '支出';
  }
}