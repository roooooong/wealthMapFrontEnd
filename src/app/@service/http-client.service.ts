import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {


  constructor(private httpClient:HttpClient) { }

  // callOpenAi(msg:string){
  //   //蜻ｼ蜿ｫApi逧・凾蛟呵ｦ∝ｸｶ驕主悉逧・堪鬆ｭ
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.OPENAI_API_KEY}`
  //   });

  //   //蜻ｼ蜿ｫApi逧・凾蛟呵ｦ∝ｸｶ驕主悉蜈ｧ螳ｹ
  //   const data = {
  //     model: 'gpt-4o-mini', //蜿ｯ莉･謾ｹ謌・gpt-4o 謌鉾pt-3.5-turbo
  //     messages:[{role: 'user', content:msg }]
  //   };

  //   //蝗轤ｺ隕∝さ驕槫・螳ｹ驕主悉謇莉･菴ｿ逕ｨpost
  //   return this.httpClient.post(this.OPENAI_URL, data, { headers });


  // }

  //隶蜿・
  getApi(url:string){
    return this.httpClient.get(url);
  }

  //譁ｰ蠅・
  postApi(url:string,postData:any={}, options: any = {}){
    return this.httpClient.post(url,postData, options);
  }

  //譖ｴ謾ｹ
  putApi(url:string,putData:any){
    return this.httpClient.put(url,putData);
  }

  //譖ｴ謾ｹ
  patchApi(url:string,patchData:any){
    return this.httpClient.patch(url,patchData);
  }

  //蛻ｪ髯､
  delApi(url:string){
    return this.httpClient.delete(url);
  }
}
