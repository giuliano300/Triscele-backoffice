import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPermissionHolidayComponent } from './add-permission-holiday.component';

describe('AddPermissionHolidayComponent', () => {
  let component: AddPermissionHolidayComponent;
  let fixture: ComponentFixture<AddPermissionHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPermissionHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPermissionHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
