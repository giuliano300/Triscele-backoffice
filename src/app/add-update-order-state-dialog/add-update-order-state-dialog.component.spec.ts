import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateOrderStateDialogComponent } from './add-update-order-state-dialog.component';

describe('AddUpdateOrderStateDialogComponent', () => {
  let component: AddUpdateOrderStateDialogComponent;
  let fixture: ComponentFixture<AddUpdateOrderStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateOrderStateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateOrderStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
