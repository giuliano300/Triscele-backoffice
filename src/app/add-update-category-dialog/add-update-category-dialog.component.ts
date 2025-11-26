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

@Component({
  selector: 'app-add-update-category-dialog',
  templateUrl: './add-update-category-dialog.component.html',
  styleUrls: ['./add-update-category-dialog.component.scss'],
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
export class AddUpdateCategoryDialogComponent {
  
  title: string = "Aggiungi categoria";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Categories,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica categoria";
      this.categoryForm.patchValue({
        name: this.data.name
      });
    }
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: Categories = {
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
