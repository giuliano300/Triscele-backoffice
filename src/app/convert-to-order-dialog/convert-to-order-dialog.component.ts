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
import { ProductMovements } from '../interfaces/productMovements';
import { MovementType, OrderStatus } from '../enum/enum';
import { ProductViewModel } from '../classess/productViewModel';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { SectorService } from '../services/Sector.service';
import { OperatorService } from '../services/Operator.service';

@Component({
  selector: 'app-convert-to-order-dialog',
  templateUrl: './convert-to-order-dialog.component.html',
  styleUrls: ['./convert-to-order-dialog.component.scss'],
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
export class ConvertToOrderDialogComponent {
  
  title: string = "Converti il preventivo in ordine";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  orderStatusOptions = [
    { value: OrderStatus.COMPLETATO, label: 'Completato' },
    { value: OrderStatus.IN_LAVORAZIONE, label: 'In lavorazione' },
    { value: OrderStatus.RIMBORSATO, label: 'Rimborsato' },
    { value: OrderStatus.IN_SOSPESO, label: 'In sospeso' },
    { value: OrderStatus.CANCELLATO, label: 'Cancellato' },
    { value: OrderStatus.FALLITO, label: 'Fallito' },
    { value: OrderStatus.SPEDITO, label: 'Spedito' },
    { value: OrderStatus.CONSEGNATO, label: 'Consegnato' },
    { value: OrderStatus.COMPLETATO_DUPLICATO, label: 'Completato duplicato' },
    { value: OrderStatus.IN_CONSEGNA, label: 'In consegna' }
  ];

  sectors: any[] = [];
  operators: any[] = [];

  constructor(public dialogRef: MatDialogRef<ConvertToOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private sectorService: SectorService,
    private operatorService: OperatorService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      status: [OrderStatus.IN_LAVORAZIONE, Validators.required],
      sectorId: [data, Validators.required],
      operatorId: [null]
    });
  }

  // carica operatori
  selectOperators(c:any){
    this.operatorService.getOperators(c.value).subscribe((data: any[]) => {
      this.operators = data;
    });
  }

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    this.sectorService.getSectors().subscribe((data: any[]) => {
      this.sectors = data;
    });

    this.operatorService.getOperators(this.data!).subscribe((data: any[]) => {
      this.operators = data;
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
