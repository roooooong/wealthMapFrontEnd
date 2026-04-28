import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogAddRebalanceComponent } from './dialog-add-rebalance.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExampleService } from '../../@service/example.service';
import { of } from 'rxjs';

describe('DialogAddRebalanceComponent', () => {
  let component: DialogAddRebalanceComponent;
  let fixture: ComponentFixture<DialogAddRebalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone 組件應放在 imports
      imports: [
        DialogAddRebalanceComponent,
        HttpClientTestingModule
      ],
      providers: [
        // 提供 Mock 物件以符合 Angular 注入系統
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ExampleService,
          useValue: { user$: of({ id: 1 }) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddRebalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
