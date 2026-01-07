import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateIllnessComponent } from './add-update-illness.component';

describe('AddUpdateIllnessComponent', () => {
  let component: AddUpdateIllnessComponent;
  let fixture: ComponentFixture<AddUpdateIllnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateIllnessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateIllnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
