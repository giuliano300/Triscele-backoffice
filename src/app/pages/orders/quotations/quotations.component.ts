import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../../../icons/feathericons/feathericons.module";
import { MatNativeDateModule, MatOptionModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter  } from "@angular/material/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { OrderStatus } from '../../../enum/enum';
import { ConvertToOrderDialogComponent } from '../../../convert-to-order-dialog/convert-to-order-dialog.component';
import { clause, generateOptionText, getOrderProductTotal } from '../../../../main';
import { MatTooltip } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, debounceTime, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

declare const pdfMake: any;

const QUOTATIONS_STATE_KEY = 'triscele:backoffice:quotations:list-state:v1';

interface QuotationsListState {
  filters: Record<string, unknown>;
  pageIndex: number;
  pageSize: number;
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
  selector: 'app-quotations',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FeathericonsModule,
    MatLabel,
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
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.scss',
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

export class QuotationsComponent {
  form: FormGroup;

  orders: Order[] = [];
  
  dataSource = new MatTableDataSource<Order>(this.orders);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  customers: Customers[] = [];
  customerCtrl = new FormControl<string | Customers>('');
  filteredCustomers!: Observable<Customers[]>;

  operators: Operators[] = [];

  IsOperatorView: boolean = false;

  firstLoading: boolean = false;

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;

  displayedColumns: string[] = [
    'select',
    'shippingBusinessName',
    'orderProducts',
    'insertDate',
    'totalPrice',
    'paymentMethod',
    'convert',
    'edit',
    'download',
    'delete'
  ];

  selection = new SelectionModel<Order>(true, []);

  OrderStatusLabels: Record<number, string> = {
    1: 'Completato',
    2: 'In lavorazione',
    3: 'Rimborsato',
    4: 'In sospeso',
    5: 'Cancellato',
    6: 'Fallito',
    10: 'Spedito',
    11: 'Preventivo',
    14: 'Consegnato',
    15: 'Completato duplicato',
    16: 'In consegna'
  };

  constructor(
      private router: Router,
      private fb: FormBuilder,
      private orderService: OrderService,
      private customerService: CustomerService,
      private operatorService: OperatorService,
      private adapter: DateAdapter<any>,
      private dialog: MatDialog
    ) 
    { 
      this.adapter.setLocale('it-IT');
      this.form = this.fb.group({
        customerId: [],
        dateRange: this.fb.group({
            start: [null],
            end: [null]
          })      
        });
    }

  ngOnInit(): void {
    const savedState = this.shouldRestoreState() ? this.getSavedState() : null;
    if (savedState) {
      this.form.patchValue(savedState.filters);
      this.pageIndex = savedState.pageIndex;
      this.pageSize = savedState.pageSize;
    } else {
      sessionStorage.removeItem(QUOTATIONS_STATE_KEY);
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

    const isOperator = localStorage.getItem('isOperator') === 'true';
    if(isOperator)
      this.IsOperatorView = true;

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
  }

  getOrders(customerId?: string, start?: string, end?: string, pageIndex: number = 0, pageSize: number = 20) {
    let query = '';
    let sectorId = '';
    this.firstLoading = true;
    
    const params = new URLSearchParams();
    params.append('preventivo', 'true');

    if (customerId || sectorId || start || end || pageIndex || pageSize) {
      params.append('page', (pageIndex + 1).toString()); 
      params.append('limit', pageSize.toString());
      if (customerId) params.append('customerId', customerId);
      if (sectorId) params.append('sectorId', sectorId);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
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
              convert:'ri-edit-line',
              delete: 'ri-delete-bin-line'
            }
          }));

          this.dataSource = new MatTableDataSource<Order>(this.orders);
          this.dataSource.sort = this.sort;
          this.selection.clear();
           this.firstLoading = false;
      });
  }

  onSubmit(){
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadCurrentPage();
  }

  remove(){
    sessionStorage.removeItem(QUOTATIONS_STATE_KEY);
    this.form.patchValue({
      customerId: [],
      operatorId: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      }
    });
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadCurrentPage();
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
    const quoteNumber = form.quoteNumber !== undefined
      ? String(form.quoteNumber).padStart(3, '0')
      : (form._id ?? 'Senza-numero');
    const documentName = `Preventivo-${quoteNumber}`;

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
                { text: `Data preventivo: ${new Date(form.insertDate).toLocaleDateString()}`, style: 'smallInfo', alignment: 'left', margin: [0, 10, 0, 10] }
              ]
            },
            {
              stack: [
                { text: documentName, style: 'subheader', alignment: 'right' }
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
                  { text: 'Note preventivo', bold: true, margin: [0, 0, 0, 5] },
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
        tableHeader: { bold: true, fillColor: '#eeeeee', fontSize: 8, color: '#333333' },
        total: { fontSize: 12, bold: true, alignment: 'right', color: '#222', margin: [0, 2, 0, 30] }
      }
    };

    pdfMake.createPdf(docDefinition).download(`${documentName}.pdf`);
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

  deleteSelected(): void {
    const selectedQuotes = [...this.selection.selected];
    if (selectedQuotes.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'CONFERMA ELIMINAZIONE MULTIPLA',
        description: `Sei sicuro di voler eliminare i ${selectedQuotes.length} preventivi selezionati?`,
        confirm: 'Cancella selezionati'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.firstLoading = true;
      forkJoin(selectedQuotes.map(quote =>
        this.orderService.delete(quote._id!).pipe(catchError(() => of(false)))
      )).subscribe(() => {
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
    if (!row) return this.isAllSelected() ? 'Deseleziona tutti i preventivi' : 'Seleziona tutti i preventivi';
    return `${this.selection.isSelected(row) ? 'Deseleziona' : 'Seleziona'} preventivo`;
  }

  private toIsoDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
  }

  ConvertItem(item: Order) {
    const dialogRef = this.dialog.open(ConvertToOrderDialogComponent, {
      data: item.sectorId?._id,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result)
      {
        const c: any = 
        {
          orderId: item._id,
          status: result.status,
          sectorId: result.sectorId,
          operatorId: result.operatorId ?? undefined,
          insertDate: result.insertDate,
          expectedDelivery: result.expectedDelivery
        };
        this.orderService.convertToOrder(c).subscribe((result: any) => {
          this.saveState();
          this.loadCurrentPage();
        })
      }
      else
        console.log("Close");
    });
  }

  UpdateItem(item: Order) {
    this.saveState();
    history.replaceState({ ...history.state, restoreListState: true }, '');
    this.router.navigate(
      ["/order/add", item._id],
      { queryParams: { state: 11 } }
    );
  }

  private loadCurrentPage(): void {
    const { customerId, dateRange } = this.form.value;
    this.getOrders(
      customerId,
      this.toIsoDate(dateRange?.start),
      this.toIsoDate(dateRange?.end),
      this.pageIndex,
      this.pageSize
    );
  }

  private saveState(): void {
    const state: QuotationsListState = {
      filters: this.form.value,
      pageIndex: this.paginator?.pageIndex ?? this.pageIndex,
      pageSize: this.paginator?.pageSize ?? this.pageSize
    };
    sessionStorage.setItem(QUOTATIONS_STATE_KEY, JSON.stringify(state));
  }

  private getSavedState(): QuotationsListState | null {
    try {
      const value = sessionStorage.getItem(QUOTATIONS_STATE_KEY);
      return value ? JSON.parse(value) as QuotationsListState : null;
    } catch {
      sessionStorage.removeItem(QUOTATIONS_STATE_KEY);
      return null;
    }
  }

  private shouldRestoreState(): boolean {
    return history.state?.restoreListState === true;
  }

}
