import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddStrategyComponent } from './dialog-add-strategy.component';

describe('DialogAddStrategyComponent', () => {
  let component: DialogAddStrategyComponent;
  let fixture: ComponentFixture<DialogAddStrategyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddStrategyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
