import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsOptionsComponent } from './products-options.component';

describe('ProductsOptionsComponent', () => {
  let component: ProductsOptionsComponent;
  let fixture: ComponentFixture<ProductsOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
