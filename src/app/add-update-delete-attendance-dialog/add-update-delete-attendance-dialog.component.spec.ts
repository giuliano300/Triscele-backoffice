import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateDeleteAttendanceDialogComponent } from './add-update-delete-attendance-dialog.component';

describe('AddUpdateDeleteAttendanceDialogComponent', () => {
  let component: AddUpdateDeleteAttendanceDialogComponent;
  let fixture: ComponentFixture<AddUpdateDeleteAttendanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateDeleteAttendanceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateDeleteAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
