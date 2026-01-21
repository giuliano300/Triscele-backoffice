import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDuplicateProductComponent } from './add-duplicate-product-dialog.component';

describe('AddDuplicateProductComponent', () => {
  let component: AddDuplicateProductComponent;
  let fixture: ComponentFixture<AddDuplicateProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDuplicateProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDuplicateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
