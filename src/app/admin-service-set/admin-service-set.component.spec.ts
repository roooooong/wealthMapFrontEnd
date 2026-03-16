import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServiceSetComponent } from './admin-service-set.component';

describe('AdminServiceSetComponent', () => {
  let component: AdminServiceSetComponent;
  let fixture: ComponentFixture<AdminServiceSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminServiceSetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminServiceSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
