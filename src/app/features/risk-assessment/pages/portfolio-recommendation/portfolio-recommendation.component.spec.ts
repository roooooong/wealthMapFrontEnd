import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioRecommendationComponent } from './portfolio-recommendation.component';

describe('PortfolioRecommendationComponent', () => {
  let component: PortfolioRecommendationComponent;
  let fixture: ComponentFixture<PortfolioRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioRecommendationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
