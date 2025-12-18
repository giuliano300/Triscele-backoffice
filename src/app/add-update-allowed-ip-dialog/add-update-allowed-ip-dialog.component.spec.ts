import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateAllowedIpDialogComponent } from './add-update-allowed-ip-dialog.component';

describe('AddUpdateAllowedIpDialogComponent', () => {
  let component: AddUpdateAllowedIpDialogComponent;
  let fixture: ComponentFixture<AddUpdateAllowedIpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateAllowedIpDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateAllowedIpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
