import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {


  constructor(private httpClient:HttpClient) { }

  // callOpenAi(msg:string){
  //   //呼叫Api的時候要帶過去的抬頭
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.OPENAI_API_KEY}`
  //   });

  //   //呼叫Api的時候要帶過去內容
  //   const data = {
  //     model: 'gpt-4o-mini', //可以改成 gpt-4o 或gpt-3.5-turbo
  //     messages:[{role: 'user', content:msg }]
  //   };

  //   //因為要傳遞內容過去所以使用post
  //   return this.httpClient.post(this.OPENAI_URL, data, { headers });


  // }

  //讀取
  getApi(url:string){
    return this.httpClient.get(url);
  }

  //新增
  postApi(url:string,postData:any={}){
    return this.httpClient.post(url,postData);
  }

  //更改
  putApi(url:string,putData:any){
    return this.httpClient.put(url,putData);
  }

  //更改
  patchApi(url:string,patchData:any){
    return this.httpClient.patch(url,patchData);
  }

  //刪除
  delApi(url:string){
    return this.httpClient.delete(url);
  }
}
