export interface Liability {
    id?: number;
    name: string;      // 負債名稱 (例如：房貸)
    category: string;  // 負債類別
    amount: number;    // 負債金額
}