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
import { Sectors } from '../interfaces/sectors';

@Component({
  selector: 'app-add-update-sector-dialog',
  templateUrl: './add-update-sector-dialog.component.html',
  styleUrls: ['./add-update-sector-dialog.component.scss'],
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
export class AddUpdateSectorDialogComponent {
  
  title: string = "Aggiungi settore";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateSectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Sectors,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica settore";
      this.categoryForm.patchValue({
        name: this.data.name,
        description: this.data.description
      });
    }
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: Sectors = {
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
