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
import { Operators } from '../../interfaces/operators';
import { OperatorService } from '../../services/Operator.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderChangeStateComponent } from '../../order-change-state-dialog/order-change-state-dialog.component';
import { OrderStateService } from '../../services/OrderState.service';
import { OrderState } from '../../interfaces/order-state';
import { calculateFinalPrice, clause, generateOptionText } from '../../../main';
import { MatTooltip } from "@angular/material/tooltip";
import { finalize, tap } from 'rxjs';

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
    'totalPrice',
    'paymentMethod',
    'status',
    'xml',
    'edit',
    'downloadCustomer',
    'downloadOperator',
    'delete'
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


  DownloadDoc(item: Order) {
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

        // Tabella prodotti
        {
          style: 'section',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Prodotto', 'Quantità', 'Prezzo', 'Totale'].map(h => ({
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
                    { text: p.quantity.toString(), margin: [5, 5, 5, 5], alignment: 'center' },
                    { text: `€${p.price.toFixed(2)}`, margin: [5, 5, 5, 5], alignment: 'right' },
                    { text: `€${calculateFinalPrice(p.price, p.quantity, p.discount, p.selectedOptions).toFixed(2)}`, margin: [5, 5, 5, 5], alignment: 'right' }
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
        tableHeader: { bold: true, fillColor: '#eeeeee' },
        total: { fontSize: 12, bold: true, alignment: 'right', color: '#222', margin: [0, 2, 0, 30] }
      }
    };

    pdfMake.createPdf(docDefinition).open();
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
              // Header della tabella: "Prodotto" e "Quantità"
              [
                { text: 'Prodotto', style: 'tableHeader', margin: [5, 5, 5, 5] },
                { text: 'Quantità', style: 'tableHeader', margin: [5, 5, 5, 5] }
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

  UpdateItem(item: Order) {
    this.router.navigate(["/order/add/" + item._id]);
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
