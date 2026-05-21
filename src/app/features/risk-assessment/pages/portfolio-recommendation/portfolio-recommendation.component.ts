import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { RiskService } from '../../services/risk.service'; // 検 蠑募・菴逧・Service
import { ExampleService } from '../../../../@service/example.service';

@Component({
  selector: 'app-portfolio-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-recommendation.component.html',
  styleUrls: ['./portfolio-recommendation.component.scss']
})
export class PortfolioRecommendationComponent implements OnInit {

  userLevel: string = '';
  userLevelChinese: string = '';
  recommendedList: any[] = [];
  isLoading: boolean = true;
  role:string='visitor';
  userId!:number;

  constructor(
    private router: Router,
    private location: Location,
    private riskService: RiskService,
    private exampleService: ExampleService // 検 豕ｨ蜈･ Service
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['level']) {
      console.log(navigation?.extras.state);
      this.userLevelChinese = navigation.extras.state['levelChinese'];
      this.userLevel = navigation.extras.state['level'];
    }
  }

  ngOnInit(): void {
    // const userId = 1; // 庁 貂ｬ隧ｦ逕ｨ ID

    // 1. 蜆ｪ蜈亥愛譁ｷ霍ｯ逕ｱ譏ｯ蜷ｦ譛牙ｸｶ驕惹ｾ・噪 level (險ｪ螳｢謌門央貂ｬ鬩怜ｮ檎噪譛・藤)
    if (this.userLevel) {
      this.fetchPortfolio(this.userLevel);
    }
    // 2. 險る務 User 迢諷具ｼ悟ｦよ棡豐呈怏 userLevel 蜑・・隧ｦ蠕・User Profile 諡ｿ
    this.exampleService.user$.subscribe(user => {
      if (user && user.role !== 'visitor') {
        this.userId = user.id;
        if (!this.userLevel && user.riskLevel) {
          this.userLevel = user.riskLevel;
          this.fetchPortfolio(this.userLevel);
        }
      }
    });

  }

  fetchPortfolio(level: string): void {
    this.isLoading = true;
    // 蜻ｼ蜿ｫ API・梧ｭ､陌・riskService 髴蟆肴㊨譁ｰ逧・URL 邨先ｧ・
    this.riskService.getRecommendations(level).subscribe({
      next: (res: any) => {
        const data = res.data;
        console.log(data);
        this.recommendedList = data.recommendations.map((item: any) => ({
          ticker: item.symbol,
          name: item.name,
          type: item.type,
          // 騾呵｣｡蜻ｼ蜿ｫ荳区婿譬ｹ謫壻ｽ逧・ｮ夂ｾｩ謾ｹ蟇ｫ逧・頃豈秘ｏ霈ｯ
          allocation: this.calculateAlloc(data.riskLevel, item.type),
          reason: item.description
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('迯ｲ蜿匁耳阮ｦ邨・粋螟ｱ謨・, err);
        this.isLoading = false;
      }
    });
  }

  // 萓晉・菴謠蝉ｾ帷噪鬚ｨ髫ｪ鬘槫挨驟肴ｯ・(CONSERVATIVE"菫晏ｮ亥梛":15/80/5, DEFENSIVE"遨ｩ蛛･蝙・:45/45/10, GROWTH"遨肴･ｵ蝙・:75/15/10)
  private calculateAlloc(level: string, type: string): number {
    switch (level) {
      case 'CONSERVATIVE':
        if (type === '谺顔寢蝙玖ｳ・箸') return 15;
        if (type === '蝗ｺ螳壽噺逶・) return 40; // 蛛・ｨｭ譛牙・蛟句し蛻ｸ讓咏噪・悟ｹｳ蛻・80%
        if (type === '蜿ｦ鬘樊兜雉・) return 5;
        return 0;
      case 'DEFENSIVE':
        if (type === '谺顔寢蝙玖ｳ・箸') return 22.5; // 蜈ｩ蛟玖ぃ逾ｨ蟷ｳ蛻・45%
        if (type === '蝗ｺ螳壽噺逶・) return 45;
        if (type === '蜿ｦ鬘樊兜雉・) return 10;
        return 0;
      case 'GROWTH':
        if (type === '谺顔寢蝙玖ｳ・箸') return 37.5; // 蜈ｩ蛟玖ぃ逾ｨ蟷ｳ蛻・75%
        if (type === '蝗ｺ螳壽噺逶・) return 15;
        if (type === '蜿ｦ鬘樊兜雉・) return 10;
        return 0;
      default:
        return 33.3;
    }
  }

  goToAssets() { this.router.navigate(['/assets']); }
  backToHome() { this.router.navigate(['/main']); }
  backToResult() { this.location.back(); }
}
