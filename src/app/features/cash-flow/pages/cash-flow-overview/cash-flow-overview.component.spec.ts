import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowOverviewComponent } from './cash-flow-overview.component';

describe('CashFlowOverviewComponent', () => {
  let component: CashFlowOverviewComponent;
  let fixture: ComponentFixture<CashFlowOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashFlowOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashFlowOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
