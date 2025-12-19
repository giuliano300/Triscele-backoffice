import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomHolodaysComponent } from './custom-holodays.component';

describe('CustomHolodaysComponent', () => {
  let component: CustomHolodaysComponent;
  let fixture: ComponentFixture<CustomHolodaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomHolodaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomHolodaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
