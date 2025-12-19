import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateHolidayDialogComponent } from './add-update-holiday-dialog.component';

describe('AddUpdateHolidayDialogComponent', () => {
  let component: AddUpdateHolidayDialogComponent;
  let fixture: ComponentFixture<AddUpdateHolidayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateHolidayDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateHolidayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
