import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProductViewModel } from '../classess/productViewModel';
import { MovementType } from '../enum/enum';
import { ProductMovements } from '../interfaces/productMovements';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'movements-dialog',
  templateUrl: './movements-dialog.component.html',
  styleUrls: ['./movements-dialog.component.scss'],
  standalone:true,
  imports: [
    MatDialogModule,
    MatCardContent,
    MatCard,
    MatFormFieldModule,
    FeathericonsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    MatTableModule
]
})
export class MovementsComponent {
  
  title: string = "Storico movimentazioni";

  dataSource = new MatTableDataSource<ProductMovements>();

  displayedColumns: string[] = [
    'createdAt',
    'movementType',
    'stock',
    'supplierName',
    'supplierCode'
  ];

  constructor(public dialogRef: MatDialogRef<MovementsComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductViewModel,
  ) {
    
  }

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

      this.dataSource = new MatTableDataSource<ProductMovements>(this.data.productMovements);
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
