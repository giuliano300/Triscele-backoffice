import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateCategoryDialogComponent } from './add-update-category-dialog.component';

describe('AlertDialogComponent', () => {
  let component: AddUpdateCategoryDialogComponent;
  let fixture: ComponentFixture<AddUpdateCategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateCategoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
