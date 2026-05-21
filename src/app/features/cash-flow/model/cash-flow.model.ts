export interface CashFlow {
    id?: number;
    userId: number;
    type: 'INCOME' | 'EXPENSE'; // 收入或支出
    category: string;           // 刁E��：例如薪水、E��飲
    amount: number;
    description: string;
    recordDate: string;         // 格式：YYYY-MM-DD
}
