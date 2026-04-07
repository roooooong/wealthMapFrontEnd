import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-privacy-set',
  imports: [FormsModule],
  templateUrl: './admin-privacy-set.component.html',
  styleUrl: './admin-privacy-set.component.scss'
})
export class AdminPrivacySetComponent {
userName:string="Admin";

isEdit:boolean=false;

edit(){
  this.isEdit = true;
}
store(){
  this.isEdit = false;
}

 //隱私條款格式
  privacyList = {
    title: '歡迎使用WealthMap財務管理工具，本網站及相關服務旨在為您提供精確的資產分析與配置建議。為了確保您能安心使用各項功能並保障您的個人權益，我們特別制定此隱私權保護政策，詳細說明我們如何處理您的個人與財務數據。在您開始使用本網站或註冊帳號之前，請務必完整閱讀本政策內容；一旦您完成註冊或開始使用本服務，即視為您已充分閱讀、瞭解並同意本政策之所有條款。若您對本政策內容有任何異議，請暫緩使用本網站，以確保您的權益不受損害。我們承諾將以最嚴謹的態度守護您的數位資產隱私，並提供安全、透明的理財環境。',
    content : [
    { id:1, title:'資料蒐集與處理', content: 'WealthMap 僅蒐集維持系統運作所必需的資訊。這包括但不限於：',item:['帳戶基本資訊：您的電子郵件地址（Email）自訂用戶名稱。','資產配置數據：您手動輸入的各項資產金額（如現金、股票、債券等分佈數據）。','系統操作紀錄：包括登入時間、IP 位址以及圖表生成頻率，用於優化系統效能與異常偵測。']},
    { id:2, title:'資料使用目的', content: '蒐集之資料僅用於以下用途：',item:['核心功能運作：計算資產佔比、生成甜甜圈圖（Doughnut Chart）及維護您的個人通知清單。','個人化財務建議：根據您的資產分佈，提供預設的再平衡建議或財務目標達成狀況。','帳戶安全驗證：確保只有您本人能存取資產敏感資訊，防止未經授權的存取。']},
    { id:3, title:'資料安全與儲存', content: '我們重視您的資料安全：',item:['密碼安全：我們不會儲存您的原始密碼，所有密碼均經過加密後存儲於資料庫。','資料儲存期限：您的資產資訊將儲存至您註銷帳號為止，我們不會保留已刪除帳號的財務紀錄。']},
    { id:4, title:'第三方揭露聲明', content: 'WealthMap 絕不會將您的個人資料、財務狀況或行為數據出售、租借或分享給任何第三方廣告商或市場研究機構。',item:[]},
    { id:5, title:'Cookie 政策', content: '我們使用微小的 Cookie 檔案來保持您的登入狀態。您可以透過瀏覽器設定禁用 Cookie，但這可能會導致部分功能（如自動登入）無法正常運作。',item:[] }
  ],
  };

constructor(
    private router: Router
  ){}

setAboutUs(){
    console.log("AboutUs");
    this.router.navigate(['/information']);
  }

  setNotification(){
    console.log("Notify");
    this.router.navigate(['/notification']);
  }

  setService(){
    console.log("Term of Service");
    this.router.navigate(['/service']);
  }

  setPrivacyPolicy(){
    console.log("Privacy Policy");
    this.router.navigate(['/privacy']);
  }
}
