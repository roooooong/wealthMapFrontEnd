export interface CashFlow {
    id?: number;
    userId: number;
    type: 'INCOME' | 'EXPENSE'; // 收入或支出
    category: string;           // 分類：例如薪水、餐飲
    amount: number;
    description: string;
    recordDate: string;         // 格式：YYYY-MM-DD
}