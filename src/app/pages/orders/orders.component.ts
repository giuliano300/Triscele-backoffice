import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatSelect } from "@angular/material/select";
import { MatNativeDateModule, MatOptionModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter  } from "@angular/material/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatInputModule } from '@angular/material/input';
import localeIt from '@angular/common/locales/it';
import { animate, style, transition, trigger } from '@angular/animations';

registerLocaleData(localeIt);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

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
    FormsModule,
    MatSort,
    MatSortModule,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
    animations: [
      trigger('fadeOut', [
        transition(':leave', [
          animate('0.5s ease-in', style({ opacity: 0 }))
        ])
      ])
    ]
})

export class OrdersComponent {
  form: FormGroup;

  orders: Order[] = [];
  
  dataSource = new MatTableDataSource<Order>(this.orders);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
      private adapter: DateAdapter<any>,
      private dialog: MatDialog
    ) 
    { 
      this.adapter.setLocale('it-IT');
      this.form = this.fb.group({
        customerId: [],
        status: [],
        dateRange: this.fb.group({
            start: [null],
            end: [null]
          })      
        });
    }

  ngOnInit(): void {
    this.getOrders();
      this.customerService.getCustomers()
      .subscribe((data: Customers[]) => {
        this.customers = data;
      });
  }

  getOrders(customerId?: string, status?: number, start?: string, end?: string) {
    let query = '';
    if (customerId || status|| start || end) {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (status) params.append('status', status.toString());
      if (start) params.append('start', start);
      if (end) params.append('end', end);
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
          this.dataSource.sort = this.sort;
       }
      });
  }

  onSubmit(){
    console.log(this.form.value);
    const { customerId, status, dateRange } = this.form.value;
    const { start, end } = dateRange || {};   
    const startFixed = new Date(start);
    startFixed.setHours(12, 0, 0, 0);

    const endFixed = new Date(end);
    endFixed.setHours(12, 0, 0, 0);    

    const s = startFixed.toISOString();
    const e = endFixed.toISOString();
    
    this.getOrders(customerId, status, s, e);
  }

  remove(){
    this.getOrders();
    this.form.patchValue({
      customerId: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      }
    });
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
