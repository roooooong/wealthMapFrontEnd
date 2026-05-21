import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invalid',
  imports: [],
  templateUrl: './invalid.component.html',
  styleUrl: './invalid.component.scss'
})
export class InvalidComponent {

  constructor(private router: Router) {
  }

  //隶馴吝掬ialogRef蜈ｨ蝓溯ｮ頑丙 遲画名菴蠕碁擇螳｣蜻顔噪DialogComponent 蠕碁擇隕∝悉蛛夐梨髢画燕遏･驕楢ｦ・梨髢牙頭蛟掬ialog
  readonly dialogRef = inject(MatDialogRef<InvalidComponent>);
  //隶灘・蝓溯ｮ頑丙逕ｨ萓・磁謾ｶ菴髢句福dialog譎ょさ驕樣ｲ萓・噪雉・侭
  readonly data = inject<any>(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }
  login() {
    this.router.navigate(['/main']);
    this.dialogRef.close();
  }
  email() {
    this.dialogRef.close();
  }
  reloginChangePwd() {
    this.router.navigate(['/profile']);
    this.dialogRef.close();
  }
   changePwd() {
    this.dialogRef.close();
  }
   error() {
    this.dialogRef.close();
  }
  goLogin(){
    this.router.navigate(['/login']);
    this.dialogRef.close();
  }
  cancel(){
    this.dialogRef.close();
  }

  switchConfirm(){
    this.dialogRef.close(true);
  }

  switchCancel(){
    this.dialogRef.close(false);
  }
}
