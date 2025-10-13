import { Component, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ProductService } from '../../../services/Product.service';
import { FeathericonsModule } from "../../../icons/feathericons/feathericons.module";
import { NgxFileDropModule } from 'ngx-file-drop';
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
import { OrderProducts } from '../../../interfaces/orderProducts';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Customers } from '../../../interfaces/customers';
import { Order } from '../../../interfaces/orders';
import { OrderService } from '../../../services/Order.service';
import { SectorService } from '../../../services/Sector.service';
import { AlertDialogComponent } from '../../../alert-dialog/alert-dialog.component';
import { Operators } from '../../../interfaces/operators';

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
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    FormsModule
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

  title: string = "Aggiungi ordine";

  productForm: FormGroup;

  id: string | null = null;

  customers: any[] = [];
  operators: any[] = [];
  sectors: any[] = [];

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
    { value: OrderStatus.IN_CONSEGNA, label: 'In consegna' },
    { value: OrderStatus.PREVENTIVO, label: 'Preventivo' }
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
    private utilsService: UtilsService,
    private orderService: OrderService,
    private sectorService: SectorService
  ) {
    this.adapter.setLocale('it-IT');
    this.productForm = this.fb.group({
      customerId: ['', Validators.required],
      operatorId: [null as string | null],
      sectorId: [''],
      agent: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      status: [OrderStatus.PREVENTIVO, Validators.required],
      insertDate: ['', Validators.required],
      expectedDelivery: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      shippingZipcode: [null, Validators.required],
      shippingName: ['', Validators.required],
      shippingLastName: ['', Validators.required],
      shippingBusinessName: ['', Validators.required],
      shippingTelephone: ['', Validators.required],
      shippingEmail: ['', Validators.required],
      shippingProvince: ['', Validators.required],
      shippingCity: ['', Validators.required],
      customerNote: [],
      note: [''],
      productIds: [''],
      products: this.fb.array([])
    });

    this.province = utilsService.getProvinceItaliane();

  }

  get productsForm() {
    return this.productForm.get('products') as FormArray;
  }

  private syncDiscount(group: FormGroup) {
    const updateFromDiscount = () => {
      const price = group.get('price')?.value || 0;
      const quantity = group.get('quantity')?.value || 0;
      const subtotal = price * quantity;
      const discount = group.get('discount')?.value || 0;

      if (subtotal > 0) {
        const perc = (discount / subtotal) * 100;
        const rounded = Math.round(perc * 100) / 100; // due decimali
        group.get('discountPercentage')?.setValue(rounded, { emitEvent: false });
      } else {
        group.get('discountPercentage')?.setValue(0, { emitEvent: false });
      }
    };

    const updateFromPercentage = () => {
      const price = group.get('price')?.value || 0;
      const quantity = group.get('quantity')?.value || 0;
      const subtotal = price * quantity;
      const perc = group.get('discountPercentage')?.value || 0;

      if (subtotal > 0) {
        const euro = (perc / 100) * subtotal;
        const rounded = Math.round(euro * 100) / 100;
        group.get('discount')?.setValue(rounded, { emitEvent: false });
      } else {
        group.get('discount')?.setValue(0, { emitEvent: false });
      }
    };

    const updateTotal = () => {
      const price = group.get('price')?.value || 0;
      const quantity = group.get('quantity')?.value || 0;
      const discount = group.get('discount')?.value || 0;
      const subtotal = price * quantity;

      const total = Math.round((subtotal - discount) * 100) / 100;
      group.get('total')?.setValue(total, { emitEvent: false });
    };

    // 🔁 Sottoscrizioni
    group.get('discount')?.valueChanges.subscribe(() => {
      updateFromDiscount();
      updateTotal();
    });

    group.get('discountPercentage')?.valueChanges.subscribe(() => {
      updateFromPercentage();
      updateTotal();
    });

    group.get('price')?.valueChanges.subscribe(() => {
      updateFromDiscount();
      updateTotal();
    });

    group.get('quantity')?.valueChanges.subscribe(() => {
      updateFromDiscount();
      updateTotal();
    });
  }

  get grandTotal(): number {
    return this.productsForm.controls.reduce((acc, ctrl) => {
      const isSubs = ctrl.get('isSubs')?.value;
      if (!isSubs) {
        const price = ctrl.get('price')?.value || 0;
        const qty = ctrl.get('quantity')?.value || 0;
        const discount = ctrl.get('discount')?.value || 0;
        return acc + (price * qty - discount);
      }
      return acc; // se isSubs è true, non aggiungere al totale
    }, 0);
  }

  selectedProducts: any[] = [];
  productCtrl = new FormControl('');
  filteredProducts!: Observable<any[]>;

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.products
      .filter(p => !this.selectedProducts.includes(p)) // escludi già scelti
      .filter(p => p.name!.toLowerCase().includes(filterValue));
  }

  selectProduct(product: any) {
    this.selectedProducts.push(product);
    this.productCtrl.setValue('');
  }

  removeProduct(product: any) {
    const index = this.selectedProducts.indexOf(product);
    if (index >= 0) {
      this.selectedProducts.splice(index, 1);
    }
  }

    // carica operatori
  selectOperators(c:any){
    this.operatorService.getOperators(c._id).subscribe((data: any[]) => {
      this.operators = data;
    });
  }

  ngOnInit(): void {
    
    this.filteredProducts = this.productCtrl.valueChanges.pipe(
      debounceTime(300), 
      switchMap(value => {
        if (value && value.length >= 2) 
          return this.productService.getProductsByName(value); 
        else 
          return of([]); 
      })
    );

    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/']);
    }

    // carica clienti
    this.customerService.getCustomers('').subscribe((data: any[]) => {
      this.customers = data;
    });

    // carica settori
    this.sectorService.getSectors().subscribe((data: any[]) => {
      this.sectors = data;
    });



    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Aggiorna ordine";

        this.orderService.getOrder(this.id)
          .subscribe((data: Order) => {
            const [year, month, day] = data.insertDate.substring(0, 10).split('-').map(Number);

            const [yearEx, monthEx, dayEx] = data.expectedDelivery.substring(0, 10).split('-').map(Number);

            this.productForm.patchValue({
              customerId: data.customerId._id.toString(),
              operatorId: data.operatorId ?  data.operatorId?._id!.toString() : '',
              sectorId: data.sectorId?._id!.toString(),
              agent: data.agent,
              paymentMethod: data.paymentMethod,
              status: data.status,
              insertDate: new Date(year, month - 1, day),
              expectedDelivery: new Date(yearEx, monthEx - 1, dayEx),
              shippingAddress: data.shippingAddress,
              shippingZipcode: data.shippingZipcode,
              shippingName: data.shippingName,
              shippingLastName: data.shippingLastName,
              shippingBusinessName: data.shippingBusinessName,
              shippingTelephone: data.shippingTelephone,
              shippingEmail: data.shippingEmail,
              shippingProvince: data.shippingProvince,
              shippingCity: data.shippingCity,
              note: data.note,
              customerNote: data.customerNote
            });
            data.orderProducts.forEach(product => {
              const group = this.fb.group({
                _id: [product._id],
                name: [product.name],
                quantity: [product.quantity || 1],
                price: [product.price],
                discount: [product.discount || 0],
                discountPercentage: [product.discountPercentage ||0],
                total: [product.total],
                isSubs: [product.isSubs],
                note: [product.note],
                parentId: [product.parentId]
              });

              this.syncDiscount(group);
              this.productsForm.push(group);
            });      
            
          const isOperator = localStorage.getItem('isOperator') === 'true';
          if(isOperator){
             const o = JSON.parse(localStorage.getItem("operator") || "{}");
             const operatorId = o.sub;  
             this.productForm.patchValue({
                operatorId: operatorId
             });
          }
          });
      }
    });
  }

  addProductToList(product: ProductViewModel){
    const exists = this.productsForm.controls.some(ctrl => {
      const group = ctrl as FormGroup;
      const id = group.get('_id')?.value;
      const parentId = group.get('parentId')?.value;

      return id === product.id && (parentId === null || parentId === undefined);
    });

    if(exists){
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {title:"Prodotto già inserito", message: "Attenzione, hai già inserito questo prodotto nell'ordine."},
        width: '500px'
      });
      this.productCtrl.setValue('');
      return;
    }

    if (!exists) {
      const group = this.fb.group({
        _id: [product.id],
        name: [product.name],
        quantity: [1],
        price: [product.price],
        discount: [0],
        total: [product.price],
        discountPercentage: [0],
        isSubs: false,
        parentId: null,
        note: ""
      });

      this.productsForm.push(group);
      if(product.subProducts){
        for(var i = 0; i < product.subProducts.length; i++)
        {
            const group = this.fb.group({
              _id: [product.subProducts[i].productId],
              name: [product.subProducts[i].name],
              quantity: [product.subProducts[i].quantity],
              price: [product.subProducts[i].price],
              discount: [0],
              total: [product.subProducts[i].price * product.subProducts[i].quantity],
              discountPercentage: [0],
              isSubs: true,
              parentId: product.id
            });
            this.productsForm.push(group);
        }
      }

      //console.log(this.productsForm.value);

      this.syncDiscount(group);

    }    
    
    this.productCtrl.setValue('');
    
  }

  returnBack() {
    this.router.navigate(["/orders"]);
  }

  removeThis(index: number) {
    const item = this.productsForm.at(index);
    if (!item) return; // sicurezza

    const parentId = item.value.parentId;
    const _id = item.value._id;

    // Rimuovi l’elemento principale
    this.productsForm.removeAt(index);
    

    // Ora rimuovi tutti quelli con parentId = idToRemove
    if(parentId == null)
      for (let i = this.productsForm.length - 1; i >= 0; i--) {
        const elem = this.productsForm.at(i).value;
        if (elem.parentId === _id)
          this.productsForm.removeAt(i);
      }
    else
      for (let i = this.productsForm.length - 1; i >= 0; i--) {
        const elem = this.productsForm.at(i).value;
        if (elem._id === parentId)
          elem.note += "<br>Rimosso prodotto: " + item.value.name;
      }
 }

 setShippingValues(c: Customers){
  this.productForm.patchValue({
    shippingAddress:c.address,
    shippingZipcode: c.zipCode,
    shippingName: c.name,
    shippingLastName: c.lastName,
    shippingBusinessName: c.businessName,
    shippingTelephone: c.mobile,
    shippingEmail: c.email,
    shippingProvince: c.province,
    shippingCity: c.city,
    customerNote: c.customerNote
  })
 }

  onSubmit() {
    const d: Date = this.productForm.value.insertDate;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    const dEx: Date = this.productForm.value.expectedDelivery;
    const yyyyEx = dEx.getFullYear();
    const mmEx = String(dEx.getMonth() + 1).padStart(2, '0');
    const ddEx = String(dEx.getDate()).padStart(2, '0');

    if (this.productForm.valid) {
      const formData: Order = {
        ...this.productForm.value,
        insertDate: `${yyyy}-${mm}-${dd}`,
        expectedDelivery: `${yyyyEx}-${mmEx}-${ddEx}` 
      };

      formData.operatorId = formData.operatorId ?? undefined;

      formData.origin = "1";
      formData.orderProducts = this.productsForm.value;

      formData.totalPrice = formData.orderProducts.filter(p => !p.isSubs)
        .map(p => (p.price * p.quantity) - (p.discount || 0))
        .reduce((acc, curr) => acc + curr, 0);

      if (this.id) {
        formData._id = this.id;
        this.orderService.updateOrder(formData)
          .subscribe((data: boolean) => {
            if (data)
              this.router.navigate(["/orders"]);
            else
              console.log("Errore durante aggiornamento");
          });
      } else {
        this.orderService.setOrder(formData)
          .subscribe((data: Order) => {
            if (data)
              this.router.navigate(["/orders"]);
            else
              console.log("Errore durante inserimento");
          });
      }
    } else {
      console.warn('Form non valido');
    }
  }

}
