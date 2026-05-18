import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoginResponseDTO, UserApi, UserInfo } from '../@interface/wealth-map';
import { jwtDecode } from 'jwt-decode'; // 引入解析工具
import { HttpClientService } from './http-client.service';

@Injectable({
  providedIn: 'root'
})

// 上面區塊 使用來告訴系統這支檔案是大家共用的
// 因為上面這區塊 在我的專案一開始執行的時候就會把這支檔案執行放在後台


export class ExampleService {

  private readonly ROLE_KEY = 'role';

  // 2026-04-08 by carly

  // 1. 建立一個包含完整資訊的 Subject，預設值為 null (代表未登入)
  private userSource = new BehaviorSubject<UserInfo| any>(this.getInitialUser());

  // 2. 暴露 Observable 讓元件監聽
  user$ = this.userSource.asObservable();

  // 2026-04-09 by carly

  constructor(
    private httpClientService: HttpClientService
  ) {
    // 初始化時，先從 localStorage 讀取先前存的身分
    // const savedRole = localStorage.getItem(this.ROLE_KEY);
    // if (savedRole) {
    //   this.roleSource.next(savedRole);
    // }


    const token = sessionStorage.getItem('token');
    if (token) {
      this.reloadUserContext();
      console.log('建構子偵測到 Token，啟動 reloadUserContext');
    }
  }



  // 2026-04-08 by carly

  /**
   * 登入成功時呼叫：存 Token 並觸發 API 撈取完整資料
   */
  setUserData(userToken: string) {
    console.log('setUserData 已啟動');
    // 1. 存入基本的 Token
    sessionStorage.setItem('token', userToken);
    try {
      // 2. 解析 Token 拿到 Email
      const decoded: any = this.decodeToken(userToken);
      console.log('解析後的 Token 內容：', decoded); // 檢查這裡有沒有 email 欄位
      const email = decoded.sub; // 假設後端把 email 放在 token 裡

      if (email) {
        // 3. 呼叫 API 查找完整資料 (如老師建議的)
        this.fetchFullUserInfo(email);
      }
    } catch (e) {
      console.error('Token 解析失敗', e);
    }

  }

  /**
   * 獲取目前數值的快照 (Snapshot)
   */
  get currentUser() {
    return this.userSource.value;
  }

  /**
   * 重新載入使用者內容 (補水機制)
   * 當使用者在「個人設定」改了名字或頭像
   */
  reloadUserContext() {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const email = this.decodeToken(token).sub; // 💡 與 setUserData 保持一致
        console.log("email:"+email);
        if (email) {
          console.log("正在重新補水資料，Email:", email);
          this.fetchFullUserInfo(email); // 重新跑一次 API，全域資料就更新了
        }
      } catch (e) {
        console.error('reloadUserContext 失敗', e);
      }
    }
  }

  /**
   * 登出：清空一切
   */
  clearUserData() {
    // 1. 建立一個預設的訪客物件 (假設你的 DTO 允許部分欄位為空)
    const visitorData: any = {
      token: '',
      role: 'visitor' // 💡 強制設定身分為 visitor
    };
    // 2. 廣播給所有監聽者
    this.userSource.next(visitorData);

    // 3. 徹底清空瀏覽器暫存
    sessionStorage.removeItem('token');
    // sessionStorage.removeItem('user_payload'); // 如果有存使用者資訊物件，也要刪掉
    sessionStorage.clear();
  }

  // 解析 Token 並獲取資料
  private decodeToken(token: string): any {
    try {
      // JWT 的第二段就是 Payload，這行指令會幫你轉成 JSON 物件
      return jwtDecode(token);
    } catch (Error) {
      console.error('Token 解析失敗', Error);
      return null;
    }
  }

  /**
   * 透過 Email 取得完整資料的私有方法
   */
  private fetchFullUserInfo(email: string) {
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/users/details?email=${email}`)
    .subscribe((info:any) => {
      // 把這份完整的使用者資訊存進 Service 或是 sessionStorage
      if(info.code===200){
        console.log('已取得完整使用者資料', info.data);
        console.log('使用者原本的資料', this.userSource.value);

        // 把後端的資料合併到目前的狀態中
        const updatedUser: UserInfo = {
          ...this.userSource.value, // 保留 token
          ...info.data,              // 覆蓋後端給的 id, email, name, assets...
        };
        // 更新你的 BehaviorSubject，這樣全 App 都拿得到最新資料
        this.userSource.next(updatedUser);
        sessionStorage.setItem('role', JSON.stringify(this.userSource.value.role));
        // sessionStorage.setItem('user_payload', JSON.stringify(this.userSource.value));

      }
    });
  }

  /**
   * 3. 獲取初始資料邏輯 (防止刷新後變回登出)，嘗試從 sessionStorage 抓取舊有的登入資訊
   */
  private getInitialUser() {
    // const saved = sessionStorage.getItem('user_payload');
    // return saved ? JSON.parse(saved) : {  role: 'visitor', token: '' };
    // 1. 檢查 SessionStorage 有沒有 Token
    const token = sessionStorage.getItem('token');

    // 2. 檢查有沒有之前暫存的 Role (你在 fetchFullUserInfo 裡有存過)
    const savedRole = sessionStorage.getItem('role');

    if (token) {
      // 💡 如果有 Token，代表是「登入狀態」的重新整理
      return {
        // 如果有存過的 role 就用，沒有就給 'loading'
        role: savedRole ? JSON.parse(savedRole) : 'loading',
        token: token
      };
    }

    // 3. 只有完全沒 Token，才是真正的訪客
    return { role: 'visitor', token: '' };
  }


}
