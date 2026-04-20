import { CanActivateFn, Router } from '@angular/router';
import { Component,inject } from '@angular/core';
import { ExampleService } from '../@service/example.service';
import { map, filter, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(ExampleService);

  // const userRole = auth.currentRole.toUpperCase(); // 💡 強制轉大寫比對

  // 💡 改用 Observable 的方式，讓 Guard 等待正確的身分出現
  return auth.user$.pipe(
    // 💡 加上 filter 確保只有在真正拿到資料(非 loading 或預設訪客)時才判斷
    filter(user => user && user.role !== 'loading'),
    // 1. 如果資料還在讀取中(假設你預設是 visitor 或 id=0)，先等一下
    // 2. 這裡可以過濾掉不穩定的中間狀態
    take(1), // 💡 關鍵：只檢查進來這一刻的身分，之後 reloadUserContext 就不會再觸發 Guard
    map(user => {
      // ✅ 關鍵：直接用參數裡的 user，不要用 auth.currentUser
      const userRole = user.role.toUpperCase();

      // const userRole = auth.currentUser.role.toUpperCase(); // 💡 強制轉大寫比對
      const allowedRoles = (route.data['roles'] as Array<string>).map(r => r.toUpperCase());

      // 💡 判斷：如果這一頁沒設定限制，或是目前身分在允許清單內，就放行
      if (!allowedRoles || allowedRoles.includes(userRole)) {
        return true;
      }

      // 💡 失敗處理
      if (userRole === 'visitor') {
        alert('請先登入');
        router.navigate(['/login']);
      } else {
        alert('您的權限不足');
        router.navigate(['/main']);
      }
      return false;
    })
  );
};
