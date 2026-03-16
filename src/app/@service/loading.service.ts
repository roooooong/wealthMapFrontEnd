import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  // 方法一
  // 去建立一個可以被訂閱的值(不用帶初始值)
  // 並且這個值是boolean類型
  // 修改也只能在這個變數做動作
  // private loading$ = new Subject<boolean>();
  private loading$ = new Subject<string>();
  // 方法二
  // 去建立一個可以被訂閱的值(需帶初始值)  並且這個值是boolean類型
  private loading2$ = new BehaviorSubject<boolean>(false);

  // .asObservable()是用來開放可被訂閱的變數的訂閱功能(不能修改值)
  _loading$ = this.loading$.asObservable();
  _loading2$ = this.loading2$.asObservable();

  constructor() { }
  test!:string;
  show(){
    this.loading$.next(this.test);
    this.loading2$.next(true);
    setTimeout(() =>{
      this.hide();
    },3000)

  }

  hide(){
    this.loading$.next(this.test);
    this.loading2$.next(false);
  }

  changeData(test:string){
    this.loading$.next(test);
  }
}
