import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-service-set',
  imports: [],
  templateUrl: './admin-service-set.component.html',
  styleUrl: './admin-service-set.component.scss'
})
export class AdminServiceSetComponent {
userName:string="Admin";
constructor(
    private router: Router
  ){}

  //使用條款格式
  serviceList = {
    title: '感謝您使用 WealthMap 財務管理工具（以下簡稱「本服務」）。本服務由 WealthMap 開發團隊（以下簡稱「本公司」）所有，當您註冊成為 WealthMap 會員時，即視為您已閱讀 WealthMap 會員使用條款（以下簡稱「本條款」）並同意受其約束，往後使用本公司其他功能或服務時亦同。',
    content : [
    { id:1, title:'認知與接受條款', content: '感謝您使用 WealthMap 財務管理工具（以下簡稱「本服務」）。當您完成註冊程序或開始使用本服務時，即表示您已閱讀、瞭解並同意接受本條款之所有內容。若您為未成年人，請在父母或監護人陪同下閱讀。',item:[]},
    { id:2, title:'服務內容與限制', content: '',item:['軟體定義：指 WealthMap 開發之網頁應用程式、更新版本及相關輔助程式。','第三方連結：本服務可能提供外部網站連結（如金融新聞、外部工具），該等網站由各業者自行負責，WealthMap 對其內容之正確性不負擔保責任。','數據性質：本服務所呈現之資產分析、圖表及建議，僅依據使用者「手動輸入」之資料進行運算，不具備法律、稅務或投資諮詢效力。']},
    { id:3, title:'會員義務與責任', content: '',item:['真實資料：您同意註冊時提供正確且真實之資料。若資料有誤導之嫌，本站得隨時終止您的使用權。','帳號保管：帳號僅限本人使用。您應妥善保管密碼，任何經由該帳號進行之活動，均視為您本人之行為。','守法承諾：絕不利用本服務從事非法交易、傳輸電腦病毒或侵害他人智慧財產權之行為。']},
    { id:4, title:'財務免責聲明', content: '',item:['投資風險：WealthMap 僅為理財輔助工具。投資必有風險，使用者依據本站數據所做出之任何決策，其獲利或損失均由使用者自行承擔。','賠償限制：除法律另有規定外，本公司對於因使用或無法使用本服務而引起之任何間接、附隨或懲罰性損害，不負賠償責任。']},
    { id:5, title:'服務修訂', content: 'WealthMap 保留隨時修改本條款之權利，修改後於網站公布即生效，不另行個別通知。',item:[] }
  ],
  };

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
