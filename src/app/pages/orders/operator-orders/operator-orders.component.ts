import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../../../icons/feathericons/feathericons.module";
import { MatSelect } from "@angular/material/select";
import { MatNativeDateModule, MatOptionModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter  } from "@angular/material/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Customers } from '../../../interfaces/customers';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Order } from '../../../interfaces/orders';
import { OrderService } from '../../../services/Order.service';
import { CustomerService } from '../../../services/Customer.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatInputModule } from '@angular/material/input';
import localeIt from '@angular/common/locales/it';
import { animate, style, transition, trigger } from '@angular/animations';
import { Operators } from '../../../interfaces/operators';
import { OperatorService } from '../../../services/Operator.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderChangeStateComponent } from '../../../order-change-state-dialog/order-change-state-dialog.component';
import { OrderStateService } from '../../../services/OrderState.service';
import { OrderState } from '../../../interfaces/order-state';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpdateOerderByOperatorComponent } from '../../../update-order-by-operator-dialog/update-order-by-operator-dialog.component';
import { clause } from '../../../../main';

declare const pdfMake: any;

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
  selector: 'app-operator-orders',
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
    MatNativeDateModule,
    MatProgressBarModule,
    MatTooltipModule
],
  templateUrl: './operator-orders.component.html',
  styleUrl: './operator-orders.component.scss',
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

export class OperatorOrdersComponent {
  form: FormGroup;

  orders: Order[] = [];
  
  dataSource = new MatTableDataSource<Order>(this.orders);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  customers: Customers[] = [];

  operators: Operators[] = [];

  orderState: OrderState[] = [];

  IsOperatorView: boolean = false;

  firstLoading: boolean = false;

  admin: boolean = true;

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;

  displayedColumns: string[] = [
    'operatorId',
    'shippingBusinessName',
    'orderProducts',
    'insertDate',
    'expectedDelivery',
    'status',
    'downloadOperator',
    'edit'
  ];

 constructor(
      private router: Router,
      private fb: FormBuilder,
      private orderService: OrderService,
      private customerService: CustomerService,
      private operatorService: OperatorService,
      private orderStateService: OrderStateService,
      private adapter: DateAdapter<any>,
      private dialog: MatDialog
    ) 
    { 
      this.adapter.setLocale('it-IT');
      this.form = this.fb.group({
        customerId: [],
        operatorId: [],
        status: [],
        dateRange: this.fb.group({
            start: [null],
            end: [null]
          })      
        });
    }

  ngOnInit(): void {
    const isOperator = localStorage.getItem('isOperator') === 'true';
    if(isOperator)
      this.IsOperatorView = true;

    this.customerService.getCustomers('')
      .subscribe((data: Customers[]) => {
        this.customers = data;
    });

    this.operatorService.getOperators()
      .subscribe((data: Operators[]) => {
        this.operators = data;
    });

    this.orderStateService.getOrderStates()
      .subscribe((data: OrderState[]) => {
        this.orderState = data;
    });
  }


  ngAfterViewInit() {
    // Chiamata iniziale
    this.getOrders('');

    // Evento cambio pagina
    this.paginator.page.subscribe(() => {
      const dateRange = this.form.value.dateRange;

      const { start, end } = dateRange || {};

      let s = '';
      let e = '';

      if (start) {
        const startFixed = new Date(start);
        startFixed.setHours(12, 0, 0, 0);
        s = startFixed.toISOString();
      }

      if (end) {
        const endFixed = new Date(end);
        endFixed.setHours(12, 0, 0, 0);
        e = endFixed.toISOString();
      }
    
      this.getOrders(
        this.form.value.customerId,
        this.form.value.operatorId,
        this.form.value.status,
        s,
        e,
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  getOrders(customerId?: string, operatorId?: string, status?: string, start?: string, end?: string, pageIndex: number = 0, pageSize: number = 20) {
    let query = '';
    let sectorId = '';
    this.firstLoading = true;

    if(this.IsOperatorView)
    {
      const o = JSON.parse(localStorage.getItem("operator") || "{}");
      operatorId = o.sub;  
      sectorId = o.sectorId;  
      this.admin = false;
    }

    if (!this.IsOperatorView && !this.displayedColumns.includes('history')) {
      const lastIndex = this.displayedColumns.length - 1;
      this.displayedColumns.splice(lastIndex, 0, 'history');
    }

    if (customerId || operatorId || sectorId || status || start || end || pageIndex || pageSize || this.admin) {
      const params = new URLSearchParams();
      params.append('page', (pageIndex + 1).toString()); 
      params.append('limit', pageSize.toString());
      if (customerId) params.append('customerId', customerId);
      if (operatorId) params.append('operatorId', operatorId);
      if (sectorId) params.append('sectorId', sectorId);
      if (status) params.append('status', status.toString());
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (this.admin) params.append('admin', this.admin ? 'true' : 'false');
      query = `?${params.toString()}`;
    }
    this.orderService.getOrders(query)
      .subscribe((response: any) => {
          const data = response.data || [];
          this.totalItems = response.total;
          this.pageSize = response.limit;
          this.pageIndex = response.page - 1;

          this.orders = data.map((p: any) => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              download: 'ri-edit-line',
              history: 'ri-search-line',
              delete: 'ri-delete-bin-line'
            }
          }));

          this.dataSource = new MatTableDataSource<Order>(this.orders);
          this.dataSource.sort = this.sort;
          this.firstLoading = false;
      });
  }

  History(item: Order){
    const dialogRef = this.dialog.open(OrderChangeStateComponent, {
      data: item.orderChangeState,
      width: '80vw',
      maxWidth: '1000px'
    });    
  }

  onSubmit(){
    const { customerId, operatorId, status, dateRange } = this.form.value;
    const { start, end } = dateRange || {};

    let s = '';
    let e = '';

    if (start) {
      const startFixed = new Date(start);
      startFixed.setHours(12, 0, 0, 0);
      s = startFixed.toISOString();
    }

    if (end) {
      const endFixed = new Date(end);
      endFixed.setHours(12, 0, 0, 0);
      e = endFixed.toISOString();
    }
    
    this.getOrders(customerId, operatorId, status, s, e);
  }

  remove(){
    this.getOrders();
    this.form.patchValue({
      customerId: [],
      operatorId: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      }
    });
  }

  getTableNote(note:string){
     return note ? note.replace(/<br\s*\/?>/gi, '\n') : '';
  }

  getMainProducts(orderProducts: any[]) {
    return orderProducts.filter(p => !p.isSubs);
  }

  private cleanNote(note: string): string {
    return note ? note.replace(/<br\s*\/?>/gi, '\n') : '';
  }

  DownloadDocOperator(item: Order) {
    const form = item;
    const products = item.orderProducts;

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        fontSize: 11,
        color: '#333'
      },
      content: [
        // Header con titolo ordine e data prevista
        {
          columns: [
            {
              stack: [
                { text: 'Triscele Srl', style: 'header' },
                { text: `Data ordine: ${new Date(form.insertDate).toLocaleDateString()}`, style: 'smallInfo', alignment: 'left', margin: [0, 10, 0, 10] }
              ]
            },
            {
              stack: [
                { text: `Ordine N. ${form._id}`, style: 'subheader', alignment: 'right' },
                { text: `Consegna prevista: ${new Date(form.expectedDelivery).toLocaleDateString()}`, style: 'smallInfo', alignment: 'right', margin: [0, 10, 0, 10] }
              ]
            }
          ]
        },

        // Dati cliente
        {
          style: 'section',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Cliente', bold: true, margin: [5, 5, 5, 5] },
                { text: 'Spedizione', bold: true, margin: [5, 5, 5, 5] }
              ],
              [
                {
                  text: `${form.shippingName} ${form.shippingLastName}\nProvincia: ${form.shippingProvince}\nTEL: ${form.shippingTelephone}`,
                  lineHeight: 1.4, margin: [5, 5, 5, 5]
                },
                {
                  text: `Indirizzo: ${form.shippingAddress}\nCAP: ${form.shippingZipcode}\nComune: ${form.shippingCity}\nProvincia: ${form.shippingProvince}`,
                  lineHeight: 1.4, margin: [5, 5, 5, 5]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc'
          },
          margin: [0, 5, 0, 15]
        },

        // Box note cliente
        form.customerNote ? {
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc'
          },
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'Note cliente', bold: true, margin: [0, 0, 0, 5] },
                  { text: form.customerNote, fontSize: 10, lineHeight: 1.3, margin: [0, 2, 0, 0] }
                ],
                fillColor: '#f3f3f3',
                margin: [10, 8, 10, 8]
              }
            ]]
          },
          margin: [0, 0, 0, 20]
        } : {},

        // Tabella prodotti (solo nome e quantità)
        {
          style: 'section',
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Prodotto', 'Quantità'].map(h => ({
                text: h, style: 'tableHeader', margin: [5, 5, 5, 5]
              })),
              ...products
                .filter(p => !p.isSubs)
                .map(p => {
                  const optionTexts = (p.selectedOptions || [])
                    .flatMap(opt => {
                      if (Array.isArray(opt)) {
                        return opt.map(o => {
                          const sp = o.selectedProduct;
                          if (!sp) return '';
                          return `• ${sp.name} (x${sp.qta || 1})`;
                        });
                      } else if (opt.selectedProduct) {
                        const sp = opt.selectedProduct;
                        return [`• ${sp.name} (x${sp.qta || 1})`];
                      } else {
                        return [];
                      }
                    })
                    .filter(Boolean);

                  return [
                    {
                      stack: [
                        { text: p.name, fontSize: 11, bold: true, margin: [5, 5, 5, 2] },
                        ...(optionTexts.length
                          ? [{ text: optionTexts.join('\n'), fontSize: 9, color: '#666', margin: [10, 0, 0, 5], lineHeight: 1.2 }]
                          : []),
                        ...(p.note ? [{
                          text: this.cleanNote(p.note),
                          fontSize: 9,
                          italics: true,
                          color: '#555',
                          margin: [5, 0, 5, 5],
                          lineHeight: 1.3
                        }] : [])
                      ]
                    },
                    { text: p.quantity.toString(), margin: [5, 5, 5, 5], alignment: 'center' }
                  ];
                })
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc'
          },
          margin: [3, 0, 3, 25]
        },

        // Box note ordine
        form.note ? {
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc'
          },
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'Note ordine', bold: true, margin: [0, 0, 0, 5] },
                  { text: form.note, fontSize: 10, lineHeight: 1.3, margin: [0, 2, 0, 0] }
                ],
                fillColor: '#f3f3f3',
                margin: [10, 8, 10, 8]
              }
            ]]
          },
          margin: [0, 0, 0, 20]
        } : {},

        //Clausola 
        {
          text: clause,
          fontSize: 8,
          color: '#555',
          lineHeight: 1.4, 
          margin: [0, 10, 0, 0]
        }

      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#222' },
        subheader: { fontSize: 14, color: '#444' },
        date: { fontSize: 11, color: '#777' },
        smallInfo: { fontSize: 11, color: '#333', bold: true },
        section: { margin: [0, 5, 0, 5] },
        tableHeader: { bold: true, fillColor: '#eeeeee' }
      }
    };

    pdfMake.createPdf(docDefinition).open();
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

  UpdateOrder(item: Order) {
    const dialogRef = this.dialog.open(UpdateOerderByOperatorComponent, {
      data: item,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.orderService.updateOnlyOperatorDataOrder(result)
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

}
