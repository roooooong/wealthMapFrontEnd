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
  editingId: number | null = null; // 邱ｨ霈ｯ讓｡蠑冗畑

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
      error: (err) => console.error('謚灘叙謾ｶ謾ｯ螟ｱ謨・, err)
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

  // 鮟樒ｷｨ霈ｯ謖蛾・・壼ｸｶ蜈･雉・侭荳ｦ髢句福陦ｨ蝟ｮ
  editCashFlow(cf: CashFlow): void {
    this.editingId = cf.id!;
    this.showAddForm = true;
    this.newType = cf.type as 'INCOME' | 'EXPENSE';
    this.newCategory = cf.category;
    this.newAmount = cf.amount;
    this.newDescription = cf.description ?? '';
    this.newRecordDate = cf.recordDate;
  }

  // 譁ｰ蠅・or 菫ｮ謾ｹ邨ｱ荳蜈･蜿｣
  submitForm(): void {
    if (!this.newCategory || !this.newAmount || !this.newRecordDate) {
      alert('隲句｡ｫ蟇ｫ螳梧紛雉・ｨ・);
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
      // 菫ｮ謾ｹ讓｡蠑・
      this.cashFlowService.updateRecord(this.editingId, payload).subscribe({
        next: () => { this.cancelForm(); this.loadData(); },
        error: () => alert('菫ｮ謾ｹ螟ｱ謨・)
      });
    } else {
      // 譁ｰ蠅樊ｨ｡蠑・
      this.cashFlowService.addRecord(payload).subscribe({
        next: () => { this.cancelForm(); this.loadData(); },
        error: () => alert('譁ｰ蠅槫､ｱ謨・)
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
    if (confirm('遒ｺ螳壼穐髯､騾咏ｭ・噺謾ｯ邏骭・ｼ・)) {
      this.cashFlowService.deleteRecord(id).subscribe({
        next: () => this.loadData(),
        error: () => alert('蛻ｪ髯､螟ｱ謨・)
      });
    }
  }

  // 蛻・ｬ・畑逧・getter
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
    return type === 'INCOME' ? '謾ｶ蜈･' : '謾ｯ蜃ｺ';
  }
}
