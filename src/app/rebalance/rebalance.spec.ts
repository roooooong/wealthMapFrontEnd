import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rebalance } from './rebalance';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

// 💡 宣告全域變數，防止 TypeScript 插件因為找不到測試框架而報紅字
declare var describe: any;
declare var beforeEach: any;
declare var it: any;
declare var expect: any;

describe('Rebalance', () => {
  let component: Rebalance;
  let fixture: ComponentFixture<Rebalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Rebalance,
        HttpClientTestingModule,
        FormsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rebalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('應該成功建立再平衡試算組件', () => {
    expect(component).toBeTruthy();
  });
});
