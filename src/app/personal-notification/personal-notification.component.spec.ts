import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalNotificationComponent } from './personal-notification.component';

describe('PersonalNotificationComponent', () => {
  let component: PersonalNotificationComponent;
  let fixture: ComponentFixture<PersonalNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
