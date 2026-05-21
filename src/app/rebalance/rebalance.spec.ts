import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rebalance } from './rebalance';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

// 庁 螳｣蜻雁・蝓溯ｮ頑丙・碁亟豁｢ TypeScript 謠剃ｻｶ蝗轤ｺ謇ｾ荳榊芦貂ｬ隧ｦ譯・楔閠悟ｱ邏・ｭ・
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

  it('諛芽ｩｲ謌仙粥蟒ｺ遶句・蟷ｳ陦｡隧ｦ邂礼ｵ・ｻｶ', () => {
    expect(component).toBeTruthy();
  });
});
