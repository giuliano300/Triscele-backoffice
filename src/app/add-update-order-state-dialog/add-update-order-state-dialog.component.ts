import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { OrderState } from '../interfaces/order-state';

@Component({
  selector: 'app-add-update-order-state-dialog',
  templateUrl: './add-update-order-state-dialog.component.html',
  styleUrls: ['./add-update-order-state-dialog.component.scss'],
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
export class AddUpdateOrderStateDialogComponent {
  
  title: string = "Aggiungi stato ordine";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateOrderStateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  OrderState,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica stato ordine";
      this.categoryForm.patchValue({
        name: this.data.name,
        color: this.data.color
      });
    }
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: OrderState = {
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
