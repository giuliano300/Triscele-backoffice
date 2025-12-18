import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AllowedIp } from '../interfaces/allowed-ip';

@Component({
  selector: 'app-add-update-allowed-ip-dialog',
  templateUrl: './add-update-allowed-ip-dialog.component.html',
  styleUrls: ['./add-update-allowed-ip-dialog.component.scss'],
  standalone:true,
  imports: [
    MatDialogModule, 
    MatCardContent, 
    MatCard, 
    MatFormField, 
    MatFormFieldModule,
    FeathericonsModule, 
    MatInputModule,
    MatIconModule,
    MatLabel, 
    CommonModule,
   ReactiveFormsModule]
})
export class AddUpdateAllowedIpDialogComponent {
  
  title: string = "Aggiungi ip";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateAllowedIpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  AllowedIp,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      ip: ['', Validators.required],
    });
  }

  

  ngOnInit(): void {
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: AllowedIp = {
        ...this.data!,
         ...this.categoryForm.value
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
