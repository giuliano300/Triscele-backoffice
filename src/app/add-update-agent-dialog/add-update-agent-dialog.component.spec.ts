import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateAgentDialogComponent } from './add-update-agent-dialog.component';

describe('AddUpdateAgentDialogComponent', () => {
  let component: AddUpdateAgentDialogComponent;
  let fixture: ComponentFixture<AddUpdateAgentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateAgentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateAgentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
