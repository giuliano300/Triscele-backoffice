import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdatePermissionHolidayComponent } from './add-update-permission-holiday.component';

describe('AddUpdatePermissionHolidayComponent', () => {
  let component: AddUpdatePermissionHolidayComponent;
  let fixture: ComponentFixture<AddUpdatePermissionHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdatePermissionHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdatePermissionHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
