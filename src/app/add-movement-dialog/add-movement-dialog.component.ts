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
  stockError = '';

  constructor(public dialogRef: MatDialogRef<AddMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductViewModel,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      movementType: [null, Validators.required],
      stock: [null, [Validators.required, Validators.min(0.000001)]],
      productId: [null, Validators.required]
    });

    this.title += " a " + data.name

  }

  

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    this.stock_type = this.data.stock_type!;

    this.form.patchValue({
      productId: this.data.id!
    });

    this.form.valueChanges.subscribe(() => this.stockError = '');
  }

  onSave() {
    const requestedStock = Number(this.form.get('stock')?.value);
    const isOutgoingMovement = Number(this.form.get('movementType')?.value) === MovementType[1].id;
    const availableStock = Number(this.data.stock ?? 0);

    if (isOutgoingMovement && requestedStock > availableStock) {
      this.stockError = 'Scarico non disponibile: quantità superiore alla giacenza.';
      return;
    }

    this.stockError = '';
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
