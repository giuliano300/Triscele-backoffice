import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrderChangeState } from '../interfaces/orderChangeState';
import { OrderStatus } from '../enum/enum';
import * as XLSX from 'xlsx';
import { OrderState } from '../interfaces/order-state';
import { OrderStateService } from '../services/OrderState.service';


@Component({
  selector: 'order-change-state-dialog',
  templateUrl: './order-change-state-dialog.component.html',
  styleUrls: ['./order-change-state-dialog.component.scss'],
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
export class OrderChangeStateComponent {
  
  title: string = "Storico cambi di stato";

  dataSource = new MatTableDataSource<OrderChangeState>();

  orderState: any[] = [];

  displayedColumns: string[] = [
    'changedAt',
    'oldStatus',
    'newStatus',
    'operatorName'
  ];

  constructor(public dialogRef: MatDialogRef<OrderChangeStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  OrderChangeState[],
    private orderStateService: OrderStateService
  ) {
    
  }

  exportToExcel() {
    // Usa dataSource.data invece di dataSource
    const dataToExport = this.dataSource.data.map(item => ({
      'Data': new Date(item.changedAt).toLocaleString('it-IT'),
      'Vecchio Stato': this.getStatusName(item.oldStatus),
      'Nuovo Stato': this.getStatusName(item.newStatus),
      'Esecutore': item.operatorName
    }));

    // Crea worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Crea workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Storico Cambi Stato');

    // Salva file
    XLSX.writeFile(wb, 'storico_cambi_stato.xlsx');
  }

  getStatusName(id: string): string{
    const status = this.orderState.find(s => s._id === id);
    return status.name || 'Sconosciuto';
  }

  ngOnInit(): void {
    if(!this.data)
      this.onClose();

    this.dataSource = new MatTableDataSource<OrderChangeState>(this.data);

    this.orderStateService.getOrderStates()
       .subscribe((data: OrderState[]) => {
         this.orderState = data;
    });
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
