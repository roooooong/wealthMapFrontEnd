import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';
import { DialogAddRebalanceComponent } from '../@dialog/dialog-add-rebalance/dialog-add-rebalance.component';
import { MatIconModule } from '@angular/material/icon';

interface PortfolioItem {
  id?: number;          // 雉・侭蠎ｫ荳ｻ骰ｵ
  stockId: string;      // 蟆肴㊨雉・侭蠎ｫ symbol
  currentPrice: number; // 菴ｿ逕ｨ閠・焔蜍戊ｼｸ蜈･・御ｸ榊ｭ倩ｳ・侭蠎ｫ
  sharesOwned: number;  // 蟆肴㊨雉・侭蠎ｫ current_shares
  targetPercentage: number; // 蟆肴㊨雉・侭蠎ｫ target_percentage
  suggestion: string;
}

@Component({
  selector: 'app-rebalance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule,MatIconModule],
  templateUrl: './rebalance.html',
  styleUrl: './rebalance.scss'
})
export class Rebalance implements OnInit {
  private readonly dialog = inject(MatDialog);
  private httpClientService = inject(HttpClientService);
  private exampleService = inject(ExampleService);

  targetTotalValue: number = 0;
  portfolio: PortfolioItem[] = [];
  userId: number = 0;

  ngOnInit(): void {
    // 險る務菴ｿ逕ｨ閠・ｳ・ｨ奇ｼ悟叙蠕・userId
    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.userId = user.id;
        this.loadPortfolioFromDb();
      }
    });
  }

  /**
   * 蠕櫁ｳ・侭蠎ｫ霈牙・蟾ｲ蜆ｲ蟄倡噪雉・箸驟咲ｽｮ
   */
  loadPortfolioFromDb() {
    console.log(this.userId);
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/rebalance/list/${this.userId}`).subscribe((res: any) => {
      if (res && Array.isArray(res)) {
        this.portfolio = res.map((item: any) => ({
          id: item.id,
          stockId: item.symbol,
          currentPrice: 0,
          sharesOwned: item.currentShares, // 雉・侭蠎ｫ谺・ｽ肴弍 currentShares
          targetPercentage: item.targetPercentage,
          suggestion: ''
        }));

        if (this.portfolio) {
          console.log(this.portfolio);

          this.portfolio.forEach(s => {
            this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/strategy-set/quote/${s.stockId}`)
              .subscribe({
                next: (res: any) => {
                  if (res.code === 200 && res.data) {
                    s.currentPrice = res.data.currentPrice ?? 0;
                  } else {
                    console.warn(`閧｡逾ｨ ${s.stockId} 蝗槫さ code:` + res.code, res);
                  }
                },
                error: (err) => {
                  console.error(`辟｡豕慕佐蜿・${s.stockId} 逧・ｱ蜒ｹ`, err);
                }
              });
          });
        }
      }
    });
  }

  /**
   * 譁ｰ蠅櫁ｳ・箸荳ｦ蜷梧ｭ･蜆ｲ蟄倩・ MySQL
   */
  addAsset() {
    const dialogRef = this.dialog.open(DialogAddRebalanceComponent, {
      width: '450px',
      data: { existingSymbols: this.portfolio.map(p => p.stockId) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.stockId) {
        /**
         * 驥崎ｦ・ｼ夐呵｣｡逧・Key 蜷咲ｨｱ蠢・郁・ Java Entity 荳閾ｴ
         * symbol -> symbol
         * targetPercentage -> targetPercentage
         * currentShares -> currentShares (Dialog 蛯ｳ蝗樒噪譏ｯ sharesOwned)
         */
        const payload = {
          userId: this.userId,
          symbol: result.stockId,
          targetPercentage: result.targetPercentage,
          currentShares: result.sharesOwned // 蟆・燕遶ｯ隶頑丙霓画鋤轤ｺ蠕檎ｫｯ谺・ｽ榊錐
        };
        console.log(payload);

        this.httpClientService.postApi('https://wealthmapbackend-production-5c68.up.railway.app/api/rebalance/save', payload).subscribe({
          next: (savedItem: any) => {
            // 蟄俶ｪ疲・蜉溷ｾ鯉ｼ悟ｰ・ｳ・侭螢灘・逡ｫ髱｢髯｣蛻・
            // this.portfolio.push({
            //   id: savedItem.id,
            //   stockId: result.stockId,
            //   currentPrice: result.currentPrice || 0,
            //   sharesOwned: result.sharesOwned,
            //   targetPercentage: result.targetPercentage,
            //   suggestion: ''
            // });
            this.loadPortfolioFromDb();
          },
          error: (err) => {
            console.error('蜆ｲ蟄伜､ｱ謨暦ｼ・, err);
            alert('蜆ｲ蟄倩・雉・侭蠎ｫ譎ら匸逕滄険隱､');
          }
        });
      }
    });
  }

  /**
   * 蜀榊ｹｳ陦｡險育ｮ嶺ｸｻ驍剰ｼｯ
   */
  calculateRebalance() {
    if (this.targetTotalValue <= 0) {
      alert('隲句・霈ｸ蜈･鬆占ｨ域兜蜈･邵ｽ驥鷹｡・);
      return;
    }

    const totalPercent = this.portfolio.reduce((sum, item) => sum + item.targetPercentage, 0);
    // 蜈∬ｨｱ蠕ｮ蟆冗噪豬ｮ鮟樊丙隱､蟾ｮ
    if (Math.abs(totalPercent - 100) > 0.01) {
      alert(`逶ｮ蜑咲ｸｽ菴疲ｯ皮ぜ ${totalPercent}%・瑚ｫ玖ｪｿ謨ｴ閾ｳ 100%`);
      return;
    }

    this.portfolio.forEach(item => {
      if (item.currentPrice > 0) {
        const targetValue = this.targetTotalValue * (item.targetPercentage / 100);
        const targetShares = Math.floor(targetValue / item.currentPrice);
        const diff = targetShares - item.sharesOwned;

        if (diff > 0) {
          item.suggestion = `蟒ｺ隴ｰ雋ｷ騾ｲ ${diff} 閧｡`;
        } else if (diff < 0) {
          item.suggestion = `蟒ｺ隴ｰ雉｣蜃ｺ ${Math.abs(diff)} 閧｡`;
        } else {
          item.suggestion = '謖∬ぃ隨ｦ蜷井ｽ疲ｯ・;
        }
      } else {
        item.suggestion = '隲玖ｼｸ蜈･蟶ょ・';
      }
    });
  }

  /**
   * 蛻ｪ髯､雉・箸
   */
  onDelete(index: number) {
    const item = this.portfolio[index];
    if (confirm(`遒ｺ螳夊ｦ∫ｧｻ髯､ ${item.stockId} 蝸趣ｼ歔)) {
      if (item.id) {
        this.httpClientService.delApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/rebalance/delete/${item.id}`).subscribe(() => {
          this.portfolio.splice(index, 1);
        });
      } else {
        this.portfolio.splice(index, 1);
      }
    }
  }
}
