import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToOrderDialogComponent } from './convert-to-order-dialog.component';

describe('ConvertToOrderDialogComponent', () => {
  let component: ConvertToOrderDialogComponent;
  let fixture: ComponentFixture<ConvertToOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertToOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertToOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
