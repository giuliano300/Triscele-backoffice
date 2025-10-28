import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateOptionsDialogComponent } from './add-update-options-dialog.component';

describe('AddUpdateOptionsDialogComponent', () => {
  let component: AddUpdateOptionsDialogComponent;
  let fixture: ComponentFixture<AddUpdateOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateOptionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
