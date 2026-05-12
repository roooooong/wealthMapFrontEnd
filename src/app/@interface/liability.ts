export interface Liability {
    id?: number;
    name: string;      // 負債名稱 (例如：房貸)
    category: string;  // 負債類別
    amount: number;    // 負債金額
    monthlyPayment?: number | null;  // 月還款
    notifyEnabled:boolean;  //是否設置繳款通知
    dueDay?: number | null;    // 每月還款日
}
