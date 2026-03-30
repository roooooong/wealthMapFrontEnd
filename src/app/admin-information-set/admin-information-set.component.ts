import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-information-set',
  imports: [],
  templateUrl: './admin-information-set.component.html',
  styleUrl: './admin-information-set.component.scss'
})
export class AdminInformationSetComponent {
  userName:string="Admin";

  constructor(
    private router: Router
  ){}

  //關於我們格式
  informationList = {
    title: '「將複雜的財務數據轉化為清晰的行動指南」。WealthMap 致力於提供一個私密、安全且極簡的平台，讓每一位使用者都能像看地圖一樣，一眼看清自己的財富走向。以下為我們的核心價值與特色:',
    content : [
    { id:1, title:'視覺化資產配置', content: 'WealthMap 核心功能圍繞著動態比例圖表，幫助您即時監控現金、股票、基金及各項投資組合的佔比。透過視覺化的反饋，您可以輕易發現資產是否過於集中，進而做出理性的調整。',item:[]},
    { id:2, title:'極致的隱私保護', content: '您的財富隱私是我們的首要考量。WealthMap 採用數據去中心化的思考模式',item:['無須強制串接：您不需要提供銀行 API 或敏感的金融授權。','自主掌控：所有數據皆由您手動輸入並受加密保護，我們絕不將資料分享給第三方。']},
    { id:3, title:'目標導向的成長', content: 'WealthMap 不僅記錄過去，更規劃未來。透過我們的「資產再平衡」建議與「財務目標追蹤」等系統，您可以設定明確的理財里程碑，並看著您的財富地圖一步步擴張。',item:[]},
    { id:4, title:'為什麼選擇 WealthMap？', content: '市面上多數 App 專注於「消費流向（記帳）」，而 WealthMap 專注於「資產存量與品質（財富管理）」。我們適合那些想要更進一步優化投資組合、追求長期穩定增長的理財實踐者。',item:[]}
  ],
  };

setAboutUs(){
    console.log("AboutUs");
    this.router.navigate(['/admin-information-set']);
  }

  setNotification(){
    console.log("Notify");
    this.router.navigate(['/admin-notification-set']);
  }

  setService(){
    console.log("Term of Service");
    this.router.navigate(['/admin-service-set']);
  }

  setPrivacyPolicy(){
    console.log("Privacy Policy");
    this.router.navigate(['/admin-privacy-set']);
  }

}
