import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOption } from "@angular/material/core";
import { MatSelect } from '@angular/material/select';
import { ProductViewModel } from '../classess/productViewModel';
import { MovementType } from '../enum/enum';
import { ProductMovements } from '../interfaces/productMovements';

@Component({
  selector: 'add-duplicate-product-dialog',
  templateUrl: './add-duplicate-product-dialog.component.html',
  styleUrls: ['./add-duplicate-product-dialog.component.scss'],
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
    MatSelect,
    CommonModule
]
})
export class AddDuplicateProductComponent {
  
  title: string = "Duplica il prodotto";

  form: FormGroup;

  suppliers: any[] = [];

  name: string = "";

  movementType: any[] = MovementType;

  numbers = [1,2,3,4,5,6,7,8,9,10];
  duplications: number[] = [];

  constructor(public dialogRef: MatDialogRef<AddDuplicateProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductViewModel,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      number: [1, Validators.required],
      productId: [this.data.id, Validators.required]
    });
    this.changeDuplicate();

    this.name = data.name ?? '';
  }

  changeDuplicate(): void {
    const count = this.form.get('number')?.value || 0;

    // Rimuove i controlli precedenti
    this.duplications.forEach(i => {
      this.form.removeControl(`duplicate_${i}`);
    });

    // Ricrea l'array
    this.duplications = Array.from({ length: count }, (_, i) => i);

    // Aggiunge nuovi FormControl
    this.duplications.forEach(i => {
      this.form.addControl(
        `duplicate_${i + 1}`,
        new FormControl('', Validators.required)
      );
    });
  }

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    this.form.patchValue({
      productId: this.data.id!
    });
  }

  onSave() {
    if (this.form.valid) {
      const result: any = {
        ...this.form.value
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
