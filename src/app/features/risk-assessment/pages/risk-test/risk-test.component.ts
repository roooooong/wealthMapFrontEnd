import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiskService } from '../../services/risk.service';
import { RiskAssessmentRequest } from '../../models/risk.model';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../../../../@dialog/invalid/invalid.component';

@Component({
  selector: 'app-risk-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 💡 必須引入 ReactiveFormsModule 才能用表單
  templateUrl: './risk-test.component.html',
  styleUrls: ['./risk-test.component.scss']
})
export class RiskTestComponent {
  riskForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private riskService: RiskService,
    private router: Router
  ) {

    this.riskForm = this.fb.group({
      ageScore: [null, Validators.required],
      knowledgeScore: [null, Validators.required],
      experienceScore: [null, Validators.required],
      toleranceScore: [null, Validators.required],
      durationScore: [null, Validators.required],
      allocationScore: [null, Validators.required]
    });
  }

readonly dialog = inject(MatDialog);
  submitTest(no:number) {
    if (this.riskForm.invalid) {
      this.riskForm.markAllAsTouched();
      // alert('您還有題目未作答喔！請確認 6 題都已選擇。');
      this.showDialog(no);
      return;
    }

    this.isSubmitting = true;

    // 將表單資料打包，準備送給 Spring Boot 後端
    const requestData: RiskAssessmentRequest = {
      userId: 1, // 先寫死 1 號使用者測試
      ...this.riskForm.value
    };





    console.log('準備傳給後端的資料:', requestData);

    // 呼叫 Service 打 API
    this.riskService.evaluateRisk(requestData).subscribe({
      next: (res) => {
        alert('計算成功！即將前往結果頁');
        // 將後端算好的結果帶到下一頁 (結果頁)
        this.router.navigate(['/risk-result'], { state: { result: res } });
      },
      error: (err) => {
        console.error('API 呼叫失敗:', err);
        alert('伺服器連線失敗，請確認後端 Spring Boot 是否已啟動。');
        this.isSubmitting = false;
      }
    });
  }


  showDialog(no:number) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data:no,
      width: '250px',
      height: '180px'
    });
    //去偵測dialogRef這個dialog甚麼時候關閉
    //如果dialog結束有傳值出來 res就是那個值
    dialogRef.afterClosed().subscribe((res) => {
      //如果有值傳遞出來
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }
}
