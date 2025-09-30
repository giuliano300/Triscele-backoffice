import { Component, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Product } from '../../../interfaces/products';
import { ProductService } from '../../../services/Product.service';
import { FeathericonsModule } from "../../../icons/feathericons/feathericons.module";
import { CategoryService } from '../../../services/Category.service';
import { SupplierService } from '../../../services/Supplier.service';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { exceedsLimit, maxLenghtUploadFile } from '../../../../main';
import { AlertDialogComponent } from '../../../alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProductViewModel } from '../../../classess/productViewModel';
import { CustomerService } from '../../../services/Customer.service';
import { OperatorService } from '../../../services/Operator.service';
import { AGENTS, OrderStatus, PaymentMethod } from '../../../enum/enum';
import {  MatDatepickerModule } from "@angular/material/datepicker";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import localeIt from '@angular/common/locales/it';
import { animate, style, transition, trigger } from '@angular/animations';
import { UtilsService } from '../../../services/utils.service';
import { data } from 'jquery';
import { OrderProducts } from '../../../interfaces/orderProducts';

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
  selector: 'app-add-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    FeathericonsModule,
    NgxFileDropModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule 
],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.scss',
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
export class AddOrderComponent {

  title: string = "Aggiungi prodotto";

  productForm: FormGroup;

  id: string | null = null;

  customers: any[] = [];
  operators: any[] = [];

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

  paymentMethods = Object.values(PaymentMethod);
 
  agents = Object.values(AGENTS);

  province: string[] = [];

  products: ProductViewModel[] = [];

  orderProducts: OrderProducts[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private customerService: CustomerService,
    private operatorService: OperatorService,
    private adapter: DateAdapter<any>,
    private utilsService: UtilsService
  ) {
    this.adapter.setLocale('it-IT');
    this.productForm = this.fb.group({
      customerId: ['', Validators.required],
      operatorId: ['', Validators.required],
      agentId: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      city: ['', Validators.required],
      orderStatus: ['', Validators.required],
      insertDate: ['', Validators.required],
      expectedDelivery: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      zipCode: [null, Validators.required],
      shippingName: ['', Validators.required],
      shippingLastName: ['', Validators.required],
      shippingBusinessName: ['', Validators.required],
      shippingTelephone: ['', Validators.required],
      shippingEmail: ['', Validators.required],
      note: [''],
      productIds: [''],
      products: this.fb.array([])
    });

    this.province = utilsService.getProvinceItaliane();

  }

  get productsForm() {
    return this.productForm.get('products') as FormArray;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/']);
    }

    // carica clienti
    this.customerService.getCustomers().subscribe((data: any[]) => {
      this.customers = data;
    });

    // carica operatori
    this.operatorService.getOperators().subscribe((data: any[]) => {
      this.operators = data;
    });

    this.productService.getProducts().subscribe((data: ProductViewModel[]) => {
      this.products = data;
    })

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Aggiorna prodotto";

        this.productService.getProduct(this.id)
          .subscribe((data: ProductViewModel) => {
            this.productForm.patchValue({
              name: data.name,
              internalCode: data.internalCode,
              categoryId: data.categoryId,
              theshold: data.theshold,
              price: data.price,
              cost: data.cost,
              enabled: data.enabled,
              stock_type: data.stock_type,
              supplierCode: data.supplierCode,
              supplierId: data.supplierId,
              description: data.description,
              files: data.files || [],
              amazonCode: data.amazonCode,
              ebayCode: data.ebayCode,
              wcCode: data.wcCode,
              manomanoCode: data.manomanoCode,
              
            });
          });
      }
    });
  }

  addProductToList(){
    const product = this.productForm.value.productIds;
    const group = this.fb.group({
        _id: [product.id],
        name: [product.name],
        quantity: [1],
        price: [product.price],
        discount: [0],
        total: [product.price]
      });
      this.productsForm.push(group);
    //console.log(this.orderProducts);
  }

  returnBack() {
    this.router.navigate(["/orders"]);
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData: Product = {
        ...this.productForm.value
      };

      if (this.id) {
        formData._id = this.id;
        this.productService.updateProduct(formData)
          .subscribe((data: boolean) => {
            if (data)
              this.router.navigate(["/products"]);
            else
              console.log("Errore durante aggiornamento");
          });
      } else {
        this.productService.setProduct(formData)
          .subscribe((data: Product) => {
            if (data)
              this.router.navigate(["/products"]);
            else
              console.log("Errore durante inserimento");
          });
      }
    } else {
      console.warn('Form non valido');
    }
  }
  
  openAlertDialog(): void {
    this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Completato',
        message: 'Hai raggiunto il massimo di ' + maxLenghtUploadFile + ' files che puoi caricare.'
      }
    });
  }

  downloadFile(file: { name: string, base64: string }) {
    const byteCharacters = atob(file.base64);
    const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

}
