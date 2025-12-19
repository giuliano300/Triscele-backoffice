import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Categories } from '../interfaces/categories';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Holiday } from '../interfaces/holidays';

@Component({
  selector: 'app-add-update-holiday-dialog',
  templateUrl: './add-update-holiday-dialog.component.html',
  styleUrls: ['./add-update-holiday-dialog.component.scss'],
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
export class AddUpdateHolidayDialogComponent {
  
  title: string = "Aggiungi festività";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateHolidayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Holiday,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      date: ['', Validators.required],
      description: ['',  Validators.required]
    });
  }

  

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica festività";
      this.categoryForm.patchValue({
        date: this.data.date,
        description: this.data.description
      });
    }
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: Holiday = {
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
