import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RiskService } from '../features/risk-assessment/services/risk.service';

@Injectable({
  providedIn: 'root'
})
export class RiskGuard implements CanActivate {

  constructor(
    private riskService: RiskService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    const userId = 1; // 庁 蛛・ｨｭ逧・userId・梧悴萓・鋤謌千匳蜈･閠・噪 ID

    // 検 蝨ｨ縲碁ｲ蜈･逡ｫ髱｢荵句燕縲搾ｼ悟・蝠丞ｾ檎ｫｯ
    return this.riskService.checkHasTested(userId).pipe(
      map(res => {
        if (res.hasTested) {
          // 圷 閠・℃莠・ｼ∫峩謗･蝨ｨ髢蜿｣謾疲穐・悟ｸｶ荳雁､ｧ遖ｮ蛹・隼驕灘悉謌千ｸｾ蝟ｮ・・
          this.router.navigate(['/risk-result'], { state: { data: res } });
          return false; // 蜿匁ｶ磯ｲ蜈･蜴滓悽逧・・擇
        }
        return true; // 豐定・℃・梧叛陦碁ｲ蜈･豁｡霑朱・擇
      }),
      catchError((err) => {
        console.error('螳郁｡帶ｪ｢譟･螟ｱ謨・, err);
        return of(true); // 蟆ｱ邂礼匸逕滄険隱､・御ｹ溷・謾ｾ陦瑚ｮ謎ｻ夜ｲ蜴ｻ
      })
    );
  }
}
