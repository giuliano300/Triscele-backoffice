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
import { OrderState } from '../interfaces/order-state';
import { OrderStateService } from '../services/OrderState.service';
import { Order } from '../interfaces/orders';
import { OperatorService } from '../services/Operator.service';

@Component({
  selector: 'app-update-order-by-operator-dialog',
  templateUrl: './update-order-by-operator-dialog.component.html',
  styleUrls: ['./update-order-by-operator-dialog.component.scss'],
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
export class UpdateOerderByOperatorComponent {
  
  title: string = "Modifica ordine";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  orderState: any[] = [];

  operators: any[] = [];

  operatorId: number |undefined = undefined;

  constructor(public dialogRef: MatDialogRef<UpdateOerderByOperatorComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Order,
    private orderStateService: OrderStateService,
    private operatorService: OperatorService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      status: [null, Validators.required],
      operatorId: [null, Validators.required],
      orderId: [null, Validators.required]
    });
  }  
  

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    const isOperator = localStorage.getItem('isOperator') === 'true';
    if(!isOperator)
      this.onClose();

    const o = JSON.parse(localStorage.getItem("operator") || "{}");
    this.operatorId = o.sub;  


    this.orderStateService.getOrderStates()
      .subscribe((data: OrderState[]) => {
        this.orderState = data;
    });

    this.operatorService.getOperators().subscribe((data: any[]) => {
      this.operators = data;
    });

    this.form.patchValue({
      orderId: this.data._id!,
      status: this.data.status?._id,
      operatorId: this.data.operatorId?._id ?? this.operatorId
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
