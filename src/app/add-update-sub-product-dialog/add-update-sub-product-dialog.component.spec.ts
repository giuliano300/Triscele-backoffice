import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSubProductsDialogComponent } from './add-update-sub-product-dialog.component';

describe('AlertDialogComponent', () => {
  let component: AddUpdateSubProductsDialogComponent;
  let fixture: ComponentFixture<AddUpdateSubProductsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateSubProductsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateSubProductsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
