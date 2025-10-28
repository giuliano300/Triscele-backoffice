import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateOptionsToOrderDialogComponent } from './add-update-options-to-order-dialog.component';

describe('AddUpdateOptionsToOrderDialogComponent', () => {
  let component: AddUpdateOptionsToOrderDialogComponent;
  let fixture: ComponentFixture<AddUpdateOptionsToOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateOptionsToOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateOptionsToOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
