import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPrivacySetComponent } from './admin-privacy-set.component';

describe('AdminPrivacySetComponent', () => {
  let component: AdminPrivacySetComponent;
  let fixture: ComponentFixture<AdminPrivacySetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPrivacySetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPrivacySetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
