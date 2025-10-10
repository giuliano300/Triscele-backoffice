import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSectorDialogComponent } from './add-update-sector-dialog.component';

describe('AddUpdateSectorDialogComponent', () => {
  let component: AddUpdateSectorDialogComponent;
  let fixture: ComponentFixture<AddUpdateSectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateSectorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateSectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
