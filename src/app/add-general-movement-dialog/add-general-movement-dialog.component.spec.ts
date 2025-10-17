import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGeneralMovementComponent } from './add-general-movement-dialog.component';

describe('AddGeneralMovementComponent', () => {
  let component: AddGeneralMovementComponent;
  let fixture: ComponentFixture<AddGeneralMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGeneralMovementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGeneralMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
