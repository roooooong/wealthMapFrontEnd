import { HttpInterceptorFn } from '@angular/common/http';



/**
 * [全開放相容牁E AuthInterceptor
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');


  // 永遠開啟 withCredentials 以支援 Session 功�E
  let clonedReq = req.clone({
    withCredentials: true
  });


  // 【修正】只有當 token 有值且不是 "undefined" 字串時，才加入 Header
  if (token && token !== 'undefined') {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }


  return next(clonedReq);
};
