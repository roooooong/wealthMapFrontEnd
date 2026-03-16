import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotificationSetComponent } from './admin-notification-set.component';

describe('AdminNotificationSetComponent', () => {
  let component: AdminNotificationSetComponent;
  let fixture: ComponentFixture<AdminNotificationSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationSetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotificationSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
