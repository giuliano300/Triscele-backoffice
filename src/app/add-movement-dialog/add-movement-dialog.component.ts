import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOption } from "@angular/material/core";
import { MatSelect } from '@angular/material/select';
import { ProductViewModel } from '../classess/productViewModel';
import { MovementType } from '../enum/enum';
import { ProductMovements } from '../interfaces/productMovements';

@Component({
  selector: 'app-movement-dialog',
  templateUrl: './add-movement-dialog.component.html',
  styleUrls: ['./add-movement-dialog.component.scss'],
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
    ReactiveFormsModule,
    MatOption,
    MatSelect
]
})
export class AddMovementComponent {
  
  title: string = "Aggiungi movimentazione";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  movementType: any[] = MovementType

  constructor(public dialogRef: MatDialogRef<AddMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductViewModel,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      movementType: [null, Validators.required],
      stock: [null, Validators.required],
      productId: [null, Validators.required]
    });
  }

  

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    this.stock_type = this.data.stock_type!;

    this.form.patchValue({
      productId: this.data.id!
    });
  }

  onSave() {
    if (this.form.valid) {
      const result: ProductMovements = {
        ...this.form.value
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
