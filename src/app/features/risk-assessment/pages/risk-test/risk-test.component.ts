import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiskService } from '../../services/risk.service';
import { RiskAssessmentRequest } from '../../models/risk.model';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../../../../@dialog/invalid/invalid.component';
import { ExampleService } from '../../../../@service/example.service';

@Component({
  selector: 'app-risk-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 庁 蠢・亥ｼ募・ ReactiveFormsModule 謇崎・逕ｨ陦ｨ蝟ｮ
  templateUrl: './risk-test.component.html',
  styleUrls: ['./risk-test.component.scss']
})
export class RiskTestComponent {
  riskForm: FormGroup;
  isSubmitting = false;
  role:string = 'visitor';
  userId!:number;

  constructor(
    private fb: FormBuilder,
    private riskService: RiskService,
    private router: Router,
    private exampleService: ExampleService
  ) {

    // this.riskForm = this.fb.group({
    //   ageScore: [null, Validators.required],
    //   knowledgeScore: [null, Validators.required],
    //   experienceScore: [null, Validators.required],
    //   toleranceScore: [null, Validators.required],
    //   durationScore: [null, Validators.required],
    //   allocationScore: [null, Validators.required]
    // });
    this.riskForm = this.fb.group({
      qOneScore: [null, Validators.required],
      qTwoScore: [null, Validators.required],
      qThreeScore: [null, Validators.required],
      qFourScore: [null, Validators.required],
      qFiveScore: [null, Validators.required],
      qSixScore: [null, Validators.required],
      qSevenScore: [null, Validators.required],
      qEightScore: [null, Validators.required],
      qNineScore: [null, Validators.required],
      qTenScore: [null, Validators.required]
    });
  }

  readonly dialog = inject(MatDialog);
  submitTest(no: number) {
    if (this.riskForm.invalid) {
      this.riskForm.markAllAsTouched();
      this.showDialog(no);
      return;
    }

    this.isSubmitting = true;

    // 蟆・｡ｨ蝟ｮ雉・侭謇灘桁・梧ｺ門ｙ騾∫ｵｦ Spring Boot 蠕檎ｫｯ
    const requestData: RiskAssessmentRequest = {
      userId: this.role==='visitor' ? 0 : this.userId,
      ...this.riskForm.value
    };


    console.log('貅門ｙ蛯ｳ邨ｦ蠕檎ｫｯ逧・ｳ・侭:', requestData);

    // 蜻ｼ蜿ｫ Service 謇・API
    this.riskService.evaluateRisk(requestData).subscribe({
      next: (res) => {
        // 蟆・ｾ檎ｫｯ邂怜･ｽ逧・ｵ先棡蟶ｶ蛻ｰ荳倶ｸ鬆・(邨先棡鬆・
        this.router.navigate(['/risk-result'], { state: { result: res } });
        console.log(res);
      },
      error: (err) => {
        console.error('API 蜻ｼ蜿ｫ螟ｱ謨・', err);
        alert('莨ｺ譛榊勣騾｣邱壼､ｱ謨暦ｼ瑚ｫ狗｢ｺ隱榊ｾ檎ｫｯ Spring Boot 譏ｯ蜷ｦ蟾ｲ蝠溷虚縲・);
        this.isSubmitting = false;
      }
    });
  }


  showDialog(no: number) {
    // 蝟ｮ驕ｸ
    //let dialogRef 譏ｯ螳｣蜻贋ｸ蛟玖ｮ頑丙 隶鍋ｳｻ邨ｱ遏･驕捺・蛟醍樟蝨ｨ隕∵磁謾ｶ蜩ｪ蛟掬ialog
    //(隕・幕蝠溽噪dialog鬆・擇逧・錐遞ｱ, {隕∝さ驕樒噪蛟ｼ蜥瑚ｨｭ螳嘲)
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: no,
      width: '250px',
      height: '180px'
    });
    //蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    //螯よ棡dialog邨先據譛牙さ蛟ｼ蜃ｺ萓・res蟆ｱ譏ｯ驍｣蛟句ｼ
    dialogRef.afterClosed().subscribe((res) => {
      //螯よ棡譛牙ｼ蛯ｳ驕槫・萓・
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user=>{
      this.role = user.role; // 逡ｶ隗定牡謾ｹ隶奇ｼ碁呵｣｡譛・・蜍戊ｧｸ逋ｼ
      if(user && user.role !== 'visitor'){
        this.userId=user.id;
      }
    });

  }
}
