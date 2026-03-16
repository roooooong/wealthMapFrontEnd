import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  // OPENAI_URL="https://api.openai.com/v1/chat/completions";
  // OPENAI_API_KEY="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";
  // OPENAI_API_KEY="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";
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
  postApi(url:string,postData:any){
    return this.httpClient.post(url,postData);
  }

  //更改
  putApi(url:string,putData:any){
    return this.httpClient.put(url,putData);
  }

  //刪除
  delApi(url:string){
    return this.httpClient.delete(url);
  }
}
