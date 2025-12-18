import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowedIpComponent } from './allowed-ip.component';

describe('AllowedIpComponent', () => {
  let component: AllowedIpComponent;
  let fixture: ComponentFixture<AllowedIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowedIpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllowedIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
