import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateProductsOptionsDialogComponent } from './add-update-products-options-dialog.component';

describe('AlertDialogComponent', () => {
  let component: AddUpdateProductsOptionsDialogComponent;
  let fixture: ComponentFixture<AddUpdateProductsOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateProductsOptionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateProductsOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
