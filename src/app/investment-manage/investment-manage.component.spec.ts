import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentManageComponent } from './investment-manage.component';

describe('InvestmentManageComponent', () => {
  let component: InvestmentManageComponent;
  let fixture: ComponentFixture<InvestmentManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
