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

  //讓這個dialogRef全域變數 等於你後面宣告的DialogComponent 後面要去做關閉才知道要關閉哪個dialog
  readonly dialogRef = inject(MatDialogRef<InvalidComponent>);
  //讓全域變數用來接收你開啟dialog時傳遞進來的資料
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
}
