import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorCalendarComponent } from './operator-calendar.component';

describe('OperatorCalendarComponent', () => {
  let component: OperatorCalendarComponent;
  let fixture: ComponentFixture<OperatorCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
