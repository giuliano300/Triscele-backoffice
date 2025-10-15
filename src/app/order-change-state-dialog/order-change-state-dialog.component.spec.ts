import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderChangeStateComponent } from './order-change-state-dialog.component';

describe('OrderChangeStateComponent', () => {
  let component: OrderChangeStateComponent;
  let fixture: ComponentFixture<OrderChangeStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderChangeStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderChangeStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
