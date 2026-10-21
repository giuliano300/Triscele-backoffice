import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatSelect } from "@angular/material/select";
import { MatNativeDateModule, MatOptionModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter  } from "@angular/material/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Operators } from '../../interfaces/operators';
import { OperatorService } from '../../services/Operator.service';
import { SectorService } from '../../services/Sector.service';
import { Sectors } from '../../interfaces/sectors';
import { UtilsService } from '../../services/utils.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderChangeStateComponent } from '../../order-change-state-dialog/order-change-state-dialog.component';
import { OrderStateService } from '../../services/OrderState.service';
import { OrderState } from '../../interfaces/order-state';
import { calculateFinalPrice, clause, generateOptionText, getOrderProductTotal } from '../../../main';
import { MatTooltip } from "@angular/material/tooltip";
import { debounceTime, finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, forkJoin } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

declare const pdfMake: any;
const ORDERS_STATE_KEY = 'triscele:backoffice:orders:list-state:v1';

interface OrdersListState {
  filters: Record<string, unknown>;
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortDirection: string;
}

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
    MatNativeDateModule,
    MatProgressBarModule,
    MatTooltip
    , MatAutocompleteModule
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
  customerCtrl = new FormControl<string | Customers>('');
  filteredCustomers!: Observable<Customers[]>;

  operators: Operators[] = [];
  sectors: Sectors[] = [];
  provinces: string[] = [];

  orderState: OrderState[] = [];

  firstLoading: boolean = false;

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  sortField = '';
  sortDirection = '';

  displayedColumns: string[] = [
    'select',
    'orderNumber',
    'shippingBusinessName',
    'orderProducts',
    'insertDate',
    'totalPrice',
    'status',
    'operatorId',
    'xml',
    'edit',
    'downloadCustomer',
    'downloadOperator',
    'delete'
  ];

  selection = new SelectionModel<Order>(true, []);

 constructor(
      private router: Router,
      private fb: FormBuilder,
      private orderService: OrderService,
      private customerService: CustomerService,
      private operatorService: OperatorService,
      private sectorService: SectorService,
      private utilsService: UtilsService,
      private orderStateService: OrderStateService,
      private adapter: DateAdapter<any>,
      private dialog: MatDialog
    ) 
    { 
      this.adapter.setLocale('it-IT');
      this.provinces = this.utilsService.getProvinceItaliane();
      this.form = this.fb.group({
        customerId: [],
        operatorId: [],
        sectorId: [],
        province: [],
        status: [],
        dateRange: this.fb.group({
            start: [null],
            end: [null]
          }),
        expectedDelivery: [null]
        });
    }

  ngOnInit(): void {
    const savedState = this.shouldRestoreState() ? this.getSavedState() : null;
    if (savedState) {
      this.form.patchValue(savedState.filters);
      this.pageIndex = savedState.pageIndex;
      this.pageSize = savedState.pageSize;
      this.sortField = savedState.sortField;
      this.sortDirection = savedState.sortDirection;
    } else {
      sessionStorage.removeItem(ORDERS_STATE_KEY);
    }

    this.filteredCustomers = this.customerCtrl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        const search = typeof value === 'string' ? value.trim() : '';
        if (typeof value === 'string') {
          this.form.get('customerId')?.setValue(null, { emitEvent: false });
        }
        return search.length >= 2
          ? this.customerService.getCustomers(`?name=${encodeURIComponent(search)}`).pipe(
              map(customers => customers.filter(customer => Boolean(customer.businessName?.trim())))
            )
          : of([]);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.customerService.getCustomers('')
      .subscribe((data: Customers[]) => {
        this.customers = data;
        const selectedCustomer = this.customers.find(customer => customer._id === this.form.value.customerId);
        if (selectedCustomer) this.customerCtrl.setValue(selectedCustomer, { emitEvent: false });
    }); 

    this.operatorService.getOperators()
      .subscribe((data: Operators[]) => {
        this.operators = data;
    });

    this.sectorService.getSectors()
      .subscribe((data: Sectors[]) => {
        this.sectors = data;
      });

    this.orderStateService.getOrderStates()
      .subscribe((data: OrderState[]) => {
        this.orderState = data;
    });
  }

  displayCustomer(customer: Customers | string | null): string {
    return typeof customer === 'object' && customer ? customer.businessName ?? '' : customer ?? '';
  }

  selectCustomer(customer: Customers): void {
    this.form.get('customerId')?.setValue(customer._id);
  }


  ngAfterViewInit() {
    this.paginator.pageIndex = this.pageIndex;
    this.paginator.pageSize = this.pageSize;
    this.loadCurrentPage();

    // Evento cambio pagina
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadCurrentPage();
    });

    this.sort.sortChange.subscribe(sort => {
      this.sortField = sort.active;
      this.sortDirection = sort.direction;
      this.paginator.pageIndex = 0;
      this.onSubmit();
    });
  }

  getOrders(customerId?: string, operatorId?: string, sectorId?: string, province?: string, status?: string, start?: string, end?: string, expectedDelivery?: string, pageIndex: number = 0, pageSize: number = 20) {
    let query = '';

    this.firstLoading = true;
    
    if (customerId || operatorId || sectorId || province || status || start || end || pageIndex || pageSize) {
      const params = new URLSearchParams();
      params.append('page', (pageIndex + 1).toString()); 
      params.append('limit', pageSize.toString());
      if (customerId) params.append('customerId', customerId);
      if (operatorId) params.append('operatorId', operatorId);
      if (sectorId) params.append('sectorId', sectorId);
      if (province) params.append('province', province);
      if (status) params.append('status', status.toString());
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (expectedDelivery) params.append('expectedDelivery', expectedDelivery);
      if (this.sortField && this.sortDirection) {
        params.append('sortField', this.sortField);
        params.append('sortDirection', this.sortDirection);
      }
      params.append('admin', 'true');
      query = `?${params.toString()}`;
    }
    this.orderService.getOrders(query)
      .pipe(
        tap(() => this.firstLoading = true),
        finalize(() => this.firstLoading = false)
      )
      .subscribe((response: any) => {
          const data = response.data || [];
          this.totalItems = response.total;
          this.pageSize = response.limit;
          this.pageIndex = response.page - 1;

          this.orders = data.map((p: any) => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              xml: 'ri-edit-line',
              download: 'ri-edit-line',
              history: 'ri-search-line',
              delete: 'ri-delete-bin-line'
            }
          }));

          this.dataSource = new MatTableDataSource<Order>(this.orders);
          this.dataSource.sort = this.sort;
          this.selection.clear();
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
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadCurrentPage();
  }

  remove(){
    sessionStorage.removeItem(ORDERS_STATE_KEY);
    this.form.patchValue({
      customerId: [],
      operatorId: [],
      sectorId: [],
      province: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      },
      expectedDelivery: null
    });
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadCurrentPage();
  }

  deleteSelected(): void {
    const selectedOrders = [...this.selection.selected];
    if (selectedOrders.length === 0) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'CONFERMA ELIMINAZIONE MULTIPLA',
        description: `Sei sicuro di voler eliminare i ${selectedOrders.length} ordini selezionati?`,
        confirm: 'Cancella selezionati'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.firstLoading = true;
      forkJoin(selectedOrders.map(order => this.orderService.delete(order._id!).pipe(catchError(() => of(false)))))
        .subscribe(() => {
          this.selection.clear();
          this.saveState();
          this.loadCurrentPage();
        });
    });
  }

  isAllSelected(): boolean {
    return this.orders.length > 0 && this.orders.every(row => this.selection.isSelected(row));
  }

  masterToggle(): void {
    if (this.isAllSelected()) this.selection.clear();
    else this.orders.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Order): string {
    if (!row) return this.isAllSelected() ? 'Deseleziona tutti gli ordini' : 'Seleziona tutti gli ordini';
    return `${this.selection.isSelected(row) ? 'Deseleziona' : 'Seleziona'} ordine`;
  }

  private toIsoDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
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


  DownloadDoc(item: Order) {
    const form = item;
    const products = item.orderProducts;
    const orderNumber = form.orderNumber !== undefined
      ? String(form.orderNumber).padStart(3, '0')
      : (form._id ?? 'Senza-numero');
    const documentName = `Ordine-${orderNumber}`;

    const docDefinition = {
      pageOrientation: 'portrait',
      pageSize: 'A4',
      pageMargins: [30, 40, 30, 40],
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
                { text: documentName, style: 'subheader', alignment: 'right' },
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

        // Tabella prodotti
        {
          style: 'section',
          table: {
            headerRows: 1,
            widths: [100, '*', '*', '*', '*', '*', '*'],
            body: [
              ['Prodotto', 'Q.tà', 'Prezzo', 'Sconto €', 'Sconto 1 %', 'Sconto 2 %', 'Totale'].map(h => ({
                text: h, style: 'tableHeader', margin: [5, 5, 5, 5]
              })),
              ...products
                .filter(p => !p.isSubs) // Filtra i prodotti non "subs" (sottoprodotti)
                .map(p => {
                  const optionTexts = (p.selectedOptions || [])
                    .flatMap(opt => generateOptionText(opt)) // Chiamata ricorsiva per gestire le opzioni
                    .filter(Boolean); // Rimuove stringhe vuote

                  return [
                    {
                      stack: [
                        { text: p.name, fontSize: 9, bold: true, margin: [3, 3, 3, 2] },
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
                    { text: p.quantity.toString(), margin: [5, 5, 5, 5], alignment: 'center' },
                    { text: `€${p.price.toFixed(2)}`, margin: [5, 5, 5, 5], alignment: 'right' },
                    { text: p.discount ? `€${p.discount.toFixed(2)}` : '-', margin: [5, 5, 5, 5], alignment: 'right' },
                    { text: `${p.discountPercentage || 0}%`, margin: [5, 5, 5, 5], alignment: 'right' },
                    { text: `${p.discountPercentage2 || 0}%`, margin: [5, 5, 5, 5], alignment: 'right' },
                    { text: `€${getOrderProductTotal(p).toFixed(2)}`, margin: [5, 5, 5, 5], alignment: 'right' }
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

        // Totale generale
        {
          columns: [
            { text: '' },
            { text: `Totale: €${form.totalPrice.toFixed(2)}`, style: 'total' }
          ]
        },

        // Clausola 
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
        tableHeader: { bold: true, fillColor: '#eeeeee', fontSize: 8, color: '#333333' },
        total: { fontSize: 12, bold: true, alignment: 'right', color: '#222', margin: [0, 2, 0, 30] }
      }
    };

    pdfMake.createPdf(docDefinition).download(`${documentName}.pdf`);
  }
  
  DownloadDocOperator(item: Order) {
    const form = item;
    const products = item.orderProducts;
    const orderNumber = form.orderNumber !== undefined
      ? String(form.orderNumber).padStart(3, '0')
      : (form._id ?? 'Senza-numero');
    const documentName = `Ordine-${orderNumber}`;

    const docDefinition = {
      pageOrientation: 'portrait',
      pageSize: 'A4',
      pageMargins: [30, 40, 30, 40],
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
                { text: documentName, style: 'subheader', alignment: 'right' },
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

        // Tabella prodotti per l'operatore, senza informazioni economiche
        {
          style: 'section',
          table: {
            headerRows: 1,
            widths: ['*', 70],
            body: [
              [
                { text: 'Prodotto', style: 'tableHeader', margin: [5, 5, 5, 5] },
                { text: 'Q.tà', style: 'tableHeader', margin: [5, 5, 5, 5] }
              ],
              ...products
                .filter(p => !p.isSubs) // Filtra i prodotti non "subs" (sottoprodotti)
                .map(p => {
                  const optionTexts = (p.selectedOptions || [])
                    .flatMap(opt => generateOptionText(opt)) // Chiamata ricorsiva per gestire le opzioni
                    .filter(Boolean); // Rimuove stringhe vuote

                  return [
                    {
                      stack: [
                        { text: p.name, fontSize: 9, bold: true, margin: [3, 3, 3, 2] },
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
        tableHeader: { bold: true, fillColor: '#eeeeee', fontSize: 8, color: '#333333' }
      }
    };

    pdfMake.createPdf(docDefinition).download(`${documentName}-operatore.pdf`);
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
              this.saveState();
              this.loadCurrentPage();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Order) {
    this.saveState();
    history.replaceState({ ...history.state, restoreListState: true }, '');
    this.router.navigate(["/order/add/" + item._id]);
  }

  private loadCurrentPage(): void {
    const { customerId, operatorId, sectorId, province, status, dateRange, expectedDelivery } = this.form.value;
    this.getOrders(
      customerId,
      operatorId,
      sectorId,
      province,
      status,
      this.toIsoDate(dateRange?.start),
      this.toIsoDate(dateRange?.end),
      this.toIsoDate(expectedDelivery),
      this.pageIndex,
      this.pageSize
    );
  }

  private saveState(): void {
    const state: OrdersListState = {
      filters: this.form.value,
      pageIndex: this.paginator?.pageIndex ?? this.pageIndex,
      pageSize: this.paginator?.pageSize ?? this.pageSize,
      sortField: this.sortField,
      sortDirection: this.sortDirection
    };
    sessionStorage.setItem(ORDERS_STATE_KEY, JSON.stringify(state));
  }

  private getSavedState(): OrdersListState | null {
    try {
      const value = sessionStorage.getItem(ORDERS_STATE_KEY);
      return value ? JSON.parse(value) as OrdersListState : null;
    } catch {
      sessionStorage.removeItem(ORDERS_STATE_KEY);
      return null;
    }
  }

  private shouldRestoreState(): boolean {
    return history.state?.restoreListState === true;
  }

  generateXML(item: Order){
  const xml = this.createXmlFromOrder(item);

  // Creazione e download del file
  const blob = new Blob([xml], { type: 'application/xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Fattura_${item._id || 'ordine'}.xml`;
  a.click();
}

private createXmlFromOrder(order: Order): string {
    const header = `
<ns2:FatturaElettronica xmlns:ns2="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
<FatturaElettronicaHeader>
  <DatiTrasmissione>
    <IdTrasmittente>
      <IdPaese>IT</IdPaese>
      <IdCodice>08973230967</IdCodice>
    </IdTrasmittente>
    <ProgressivoInvio>DVpIF</ProgressivoInvio>
    <FormatoTrasmissione>FPR12</FormatoTrasmissione>
    <CodiceDestinatario>A4707H7</CodiceDestinatario>
    <PECDestinatario>maggiorconsiglio@pec.it</PECDestinatario>
  </DatiTrasmissione>

  <CedentePrestatore>
    <DatiAnagrafici>
      <IdFiscaleIVA>
        <IdPaese>IT</IdPaese>
        <IdCodice>02693860815</IdCodice>
      </IdFiscaleIVA>
      <Anagrafica>
        <Denominazione>Triscele Srl</Denominazione>
      </Anagrafica>
      <RegimeFiscale>RF01</RegimeFiscale>
    </DatiAnagrafici>
    <Sede>
      <Indirizzo>CONTRADA BOVARELLA SNC</Indirizzo>
      <CAP>91018</CAP>
      <Comune>SALEMI TP</Comune>
      <Nazione>IT</Nazione>
    </Sede>
  </CedentePrestatore>

  <CessionarioCommittente>
    <IdFiscaleIVA>
        <IdPaese>IT</IdPaese>
        <IdCodice>${order.customerId.vatNumber}</IdCodice>
    </IdFiscaleIVA>
    <DatiAnagrafici>
      <Anagrafica>
        <Denominazione>${order.shippingBusinessName}</Denominazione>
      </Anagrafica>
    </DatiAnagrafici>
    <Sede>
      <Indirizzo>${order.shippingAddress}</Indirizzo>
      <CAP>${order.shippingZipcode}</CAP>
      <Comune>${order.shippingCity}</Comune>
      <Nazione>IT</Nazione>
    </Sede>
  </CessionarioCommittente>
</FatturaElettronicaHeader>
`;

// Corpo (prodotti)
const bodyLines = order.orderProducts
  .map((p, i) => {
    // Somma opzioni selezionate (se presenti)
    const optionsTotal = (p.selectedOptions ?? [])
      .flat()
      .reduce((sum, opt) => {
        const price = opt?.selectedProduct?.price ?? 0;
        const qta = opt?.selectedProduct?.qta ?? 1;
        return sum + (price * qta);
      }, 0);

    // Descrizione arricchita
    const optionDescriptions = (p.selectedOptions ?? [])
      .flat()
      .map(opt => {
        const val = opt?.selectedProduct?.name ?? opt?.value ?? '';
        return val ? `${opt.name}: ${val}` : '';
      })
      .filter(v => !!v);

    const descrizione = this.escapeXml(
      [p.name].join(' | ')
    );

    // Totale finale per la riga
    const totalWithOptions = p.total + optionsTotal;

    return `
      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${descrizione}</Descrizione>
        <Quantita>${p.quantity}</Quantita>
        <PrezzoUnitario>${totalWithOptions.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${totalWithOptions.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>`;
  })
  .join('');

// Calcolo totale documento (somma dei totali con opzioni)
const imponibile = order.orderProducts.reduce((a, p) => {
  const optionsTotal = (p.selectedOptions ?? [])
    .flat()
    .reduce((sum, opt) => {
      const price = opt?.selectedProduct?.price ?? 0;
      const qta = opt?.selectedProduct?.qta ?? 1;
      return sum + (price * qta);
    }, 0);
  return a + p.total + optionsTotal;
}, 0);

const iva = imponibile * 0.22;
const totale = imponibile + iva;


    const body = `
<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD01</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>${order.insertDate}</Data>
      <Numero>${order._id || 'ORD001'}</Numero>
      <ImportoTotaleDocumento>${totale.toFixed(2)}</ImportoTotaleDocumento>
    </DatiGeneraliDocumento>
  </DatiGenerali>

  <DatiBeniServizi>
    ${bodyLines}
    <DatiRiepilogo>
      <AliquotaIVA>22.00</AliquotaIVA>
      <ImponibileImporto>${imponibile.toFixed(2)}</ImponibileImporto>
      <Imposta>${iva.toFixed(2)}</Imposta>
    </DatiRiepilogo>
  </DatiBeniServizi>

  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>${order.paymentMethod || 'MP08'}</ModalitaPagamento>
      <ImportoPagamento>${totale.toFixed(2)}</ImportoPagamento>
    </DettaglioPagamento>
  </DatiPagamento>
</FatturaElettronicaBody>
</ns2:FatturaElettronica>`;

    return header + body;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

}
