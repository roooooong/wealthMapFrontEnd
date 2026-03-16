import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInformationSetComponent } from './admin-information-set.component';

describe('AdminInformationSetComponent', () => {
  let component: AdminInformationSetComponent;
  let fixture: ComponentFixture<AdminInformationSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInformationSetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInformationSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
