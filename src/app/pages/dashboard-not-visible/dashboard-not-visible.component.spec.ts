import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNotVisibleComponent } from './dashboard-not-visible.component';

describe('DashboardNotVisibleComponent', () => {
  let component: DashboardNotVisibleComponent;
  let fixture: ComponentFixture<DashboardNotVisibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardNotVisibleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardNotVisibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
