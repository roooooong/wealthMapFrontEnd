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

  private readonly ROLE_KEY = 'user_role';

  constructor(
    private httpClientService: HttpClientService
  ) {
    // 初始化時，先從 localStorage 讀取先前存的身分
    const savedRole = localStorage.getItem(this.ROLE_KEY);
    if (savedRole) {
      this.roleSource.next(savedRole);
    }


    const token = localStorage.getItem('token');
    if (token) {
      this.reloadUserContext();
      console.log('建構子偵測到 Token，啟動 reloadUserContext');
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



  // 2026-04-08 by carly

  // 1. 建立一個包含完整資訊的 Subject，預設值為 null (代表未登入)
  private userSource = new BehaviorSubject<UserInfo>(this.getInitialUser());

  // 2. 暴露 Observable 讓元件監聽
  user$ = this.userSource.asObservable();


  // 登入成功後的處理流程
  setUserData(userToken: string) {
    console.log('setUserData 已啟動');
    // 1. 存入基本的 Token
    localStorage.setItem('token', userToken);
    try {
      // 2. 解析 Token 拿到 Email
      const decoded: any = this.decodeToken(userToken);
      console.log('解析後的 Token 內容：', decoded); // 💡 檢查這裡有沒有 email 欄位
      const email = decoded.sub; // 假設後端把 email 放在 token 裡

      if (email) {
        // 3. 呼叫 API 查找完整資料 (如老師建議的)
        this.fetchFullUserInfo(email);
      }
    } catch (e) {
      console.error('Token 解析失敗', e);
    }

  }

  // 獲取目前數值的快照 (Snapshot)
  get currentUser() {
    return this.userSource.value;
  }

  // 當使用者在「個人設定」改了名字或頭像
  reloadUserContext() {
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.decodeToken(token).email;
      console.log("email:"+email);
      this.fetchFullUserInfo(email); // 重新跑一次 API，全域資料就更新了
    }
  }

  // 💡 登出時清空
  clearUserData() {
    // 1. 建立一個預設的訪客物件 (假設你的 DTO 允許部分欄位為空)
    const visitorData: any = {
      token: '',
      userId: 0,
      userName: '訪客',
      role: 'visitor' // 💡 強制設定身分為 visitor
    };
    // 2. 廣播給所有監聽者
    this.userSource.next(visitorData);

    // 3. 徹底清空瀏覽器暫存
    localStorage.removeItem('token');
    localStorage.removeItem('user_payload'); // 如果有存使用者資訊物件，也要刪掉
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


  // 透過 Email 取得完整資料的私有方法
  private fetchFullUserInfo(email: string) {
    this.httpClientService.getApi(`http://localhost:8080/api/users/details?email=${email}`)
    .subscribe((info:any) => {
      // 把這份完整的使用者資訊存進 Service 或是 localStorage
      if(info.code===200){
        console.log('已取得完整使用者資料', info.data);
        console.log('使用者原本的資料', this.userSource.value);

        // 把後端的資料合併到目前的狀態中
        const updatedUser: UserInfo = {
          ...this.userSource.value!, // 保留 token
          ...info.data,              // 覆蓋後端給的 id, email, name, assets...
        };
        // 更新你的 BehaviorSubject，這樣全 App 都拿得到最新資料
        this.userSource.next(updatedUser);
        localStorage.setItem('user_payload', JSON.stringify(this.userSource.value));

      }
    });
  }

  /**
   * 3. 獲取初始資料邏輯 (防止刷新後變回登出)，嘗試從 localStorage 抓取舊有的登入資訊
   */
  private getInitialUser() {
    const saved = localStorage.getItem('user_payload');
    return saved ? JSON.parse(saved) : {  role: 'visitor', token: '' };
  }


}
