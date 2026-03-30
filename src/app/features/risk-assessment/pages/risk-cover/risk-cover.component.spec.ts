import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskCoverComponent } from './risk-cover.component';

describe('RiskCoverComponent', () => {
  let component: RiskCoverComponent;
  let fixture: ComponentFixture<RiskCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskCoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
