import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorIllnessComponent } from './operator-illness.component';

describe('OperatorIllnessComponent', () => {
  let component: OperatorIllnessComponent;
  let fixture: ComponentFixture<OperatorIllnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorIllnessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorIllnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
