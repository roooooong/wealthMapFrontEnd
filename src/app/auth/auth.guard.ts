import { CanActivateFn, Router } from '@angular/router';
import { Component,inject } from '@angular/core';
import { ExampleService } from '../@service/example.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(ExampleService);

  const userRole = auth.currentRole.toUpperCase(); // 💡 強制轉大寫比對
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
};
