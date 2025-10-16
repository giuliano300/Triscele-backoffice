import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { OrderState } from '../../interfaces/order-state';
import { OrderStateService } from '../../services/OrderState.service';
import { AddUpdateOrderStateDialogComponent } from '../../add-update-order-state-dialog/add-update-order-state-dialog.component';
import { OrderStatus } from '../../enum/enum';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-order-state',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule, NgIf],
  templateUrl: './order-state.component.html',
  styleUrl: './order-state.component.scss'
})
export class OrderStateComponent {

  orderState: OrderState[] = [];

  displayedColumns: string[] = ['name', 'color', 'edit', 'delete'];

  dataSource = new MatTableDataSource<OrderState>(this.orderState);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private orderStateService: OrderStateService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getOrderStates();
   }

  getOrderStates(){
    this.orderStateService.getOrderStates()
    .subscribe((data: OrderState[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.orderState = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<OrderState>(this.orderState);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  showDelete(item?:OrderState): boolean{
    if(item?._id == OrderStatus.IN_LAVORAZIONE)
      return false;

    return true;
  }

  OpenPopUp(item?:OrderState){
    const dialogRef = this.dialog.open(AddUpdateOrderStateDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: OrderState) => {
      if (result) 
      {
        if(!item)
          this.orderStateService.setgetOrderState(result)
            .subscribe((data: OrderState) => {
              if(data) 
                this.getOrderStates();
          });
        else
          this.orderStateService.updategetOrderState(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getOrderStates();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item: OrderState){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.orderStateService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getOrderStates();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: OrderState){
    this.OpenPopUp(item);
  }

}
