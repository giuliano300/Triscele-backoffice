import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOerderByOperatorComponent } from './update-order-by-operator-dialog.component';

describe('UpdateOerderByOperatorComponent', () => {
  let component: UpdateOerderByOperatorComponent;
  let fixture: ComponentFixture<UpdateOerderByOperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOerderByOperatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOerderByOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
