import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionHolidayComponent } from './permission-holiday.component';

describe('PermissionHolidayComponent', () => {
  let component: PermissionHolidayComponent;
  let fixture: ComponentFixture<PermissionHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
