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

  // 新增表單變數
  showAddForm: boolean = false;
  newType: 'INCOME' | 'EXPENSE' = 'INCOME';
  newCategory: string = '';
  newAmount: number | null = null;
  newDescription: string = '';
  newRecordDate: string = '';

  // 統計變數
  totalIncome: number = 0;
  totalExpense: number = 0;
  netAmount: number = 0;

  constructor(
    private cashFlowService: CashFlowService,
    private exampleService: ExampleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 跟 asset-overview 一樣，訂閱 user$ 拿真實 ID
    this.exampleService.user$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
        console.log('✅ 抓到真實使用者 ID:', this.currentUserId);
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

  addCashFlow(): void {
    if (!this.newCategory || !this.newAmount || !this.newRecordDate) {
      alert('請填寫完整資訊');
      return;
    }

    const payload: CashFlow = {
      userId: this.currentUserId,
      type: this.newType,
      category: this.newCategory,
      amount: Number(this.newAmount),  // 確保是數字
      description: this.newDescription,
      recordDate: this.newRecordDate
    };

    this.cashFlowService.addRecord(payload).subscribe({
      next: () => {
        this.showAddForm = false;
        this.resetForm();
        this.loadData();
      },
      error: () => alert('新增失敗')
    });
  }

  deleteCashFlow(id: number): void {
    if (confirm('確定刪除這筆收支紀錄？')) {
      this.cashFlowService.deleteRecord(id).subscribe({
        next: () => this.loadData(),
        error: () => alert('刪除失敗')
      });
    }
  }

  resetForm(): void {
    this.newType = 'INCOME';
    this.newCategory = '';
    this.newAmount = null;
    this.newDescription = '';
    this.newRecordDate = '';
  }

  backToAsset(): void {
    this.router.navigate(['/assets']);
  }

  translateType(type: string): string {
    return type === 'INCOME' ? '收入' : '支出';
  }
}