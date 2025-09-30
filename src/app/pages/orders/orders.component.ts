import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatSelect } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customers } from '../../interfaces/customers';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Order } from '../../interfaces/orders';
import { OrderService } from '../../services/Order.service';
import { CustomerService } from '../../services/Customer.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-orders',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FeathericonsModule,
    MatLabel,
    MatSelect,
    MatOptionModule,
    MatFormField,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  form: FormGroup;

  orders: Order[] = [];
  
  dataSource = new MatTableDataSource<Order>(this.orders);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  customers: Customers[] = [];

  displayedColumns: string[] = [
    'shippingBusinessName',
    'orderProducts',
    'insertDate',
    'totalPrice',
    'paymentMethod',
    'note',
    'status',
    'edit',
    'delete'
  ];

  OrderStatusLabels: Record<number, string> = {
    1: 'Completato',
    2: 'In lavorazione',
    3: 'Rimborsato',
    4: 'In sospeso',
    5: 'Cancellato',
    6: 'Fallito',
    10: 'Spedito',
    14: 'Consegnato',
    15: 'Completato duplicato',
    16: 'In consegna'
  };


  constructor(
      private router: Router,
      private fb: FormBuilder,
      private orderService: OrderService,
      private customerService: CustomerService,
      private dialog: MatDialog
    ) 
    { 
      this.form = this.fb.group({
        customerId: []
      });
    }

  ngOnInit(): void {
    this.getOrders();
      this.customerService.getCustomers()
      .subscribe((data: Customers[]) => {
        this.customers = data;
      });
  }

  getOrders(customerId?: string) {
    let query = '';
    if (customerId) {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      query = `?${params.toString()}`;
    }
    this.orderService.getOrders(query)
      .subscribe((data: Order[]) => {
        if (!data || data.length === 0) {
            this.dataSource.data = [];
            this.dataSource.paginator = this.paginator;        
        } else {
          this.orders = data.map(p => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              delete: 'ri-delete-bin-line'
            }
          }));
          this.dataSource = new MatTableDataSource<Order>(this.orders);
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  onSubmit(){

  }

  DeleteItem(item: Order) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.orderService.delete(item!._id!)
          .subscribe((data: boolean) => {
            if (data) {
              this.getOrders();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Order) {
    this.router.navigate(["/order/add/" + item._id]);
  }

}
