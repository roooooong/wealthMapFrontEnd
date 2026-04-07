import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// 上面區塊 使用來告訴系統這支檔案是大家共用的
// 因為上面這區塊 在我的專案一開始執行的時候就會把這支檔案執行放在後台


export class ExampleService {

  private readonly ROLE_KEY = 'user_role';

  constructor() {
    // 初始化時，先從 localStorage 讀取先前存的身分
    const savedRole = localStorage.getItem(this.ROLE_KEY);
    if (savedRole) {
      this.roleSource.next(savedRole);
    }
  }
  private roleSource = new BehaviorSubject<string>('visitor');

  // 💡 2. 暴露一個 Observable 讓所有組件監聽
  role$ = this.roleSource.asObservable();

  // 💡 3. 登入成功時呼叫此方法
  setRole(newRole: string) {
    localStorage.setItem(this.ROLE_KEY, newRole); // 存入 localStorage
    this.roleSource.next(newRole);
  }

  // 獲取目前數值 (同步)
  get currentRole() {
    return this.roleSource.value;
  }
  // 登出時清除
  clearRole() {
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem('token'); // 同時清除 token
    this.roleSource.next('visitor');
  }
}
