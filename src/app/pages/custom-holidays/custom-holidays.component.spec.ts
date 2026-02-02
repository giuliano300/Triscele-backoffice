import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomHolidaysComponent } from './custom-holidays.component';

describe('CustomHolidaysComponent', () => {
  let component: CustomHolidaysComponent;
  let fixture: ComponentFixture<CustomHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
