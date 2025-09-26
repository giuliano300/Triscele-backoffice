import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
    FeathericonsModule
],
  templateUrl: './add-update-product.component.html',
  styleUrl: './add-update-product.component.scss'
})
export class AddProductComponent {

  title: string = "Aggiungi prodotto";

  productForm: FormGroup;

  id: string | null = null;

  categories: any[] = [];
  suppliers: any[] = [];

  stockTypes = [
    { value: 'pezzi', label: 'Pezzi' },
    { value: 'm', label: 'Metri' },
    { value: 'l', label: 'Litri' },
    { value: 'kg', label: 'KG' },
    { value: 'ha', label: 'Ettari' },
    { value: 'sq km', label: 'km²' },
    { value: 'sq m', label: 'm²' },
    { value: 'sq cm', label: 'cm²' },
    { value: 'sq mm', label: 'mm²' },
    { value: 'acs', label: 'Acri' },
    { value: 'sq. mi.', label: 'mi²' },
    { value: 'sq. yd.', label: 'yd²' },
    { value: 'sq. ft.', label: 'ft²' },
    { value: 'sq. in.', label: 'in²' },
  ];


  constructor(
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private supplierService: SupplierService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      internalCode: ['', Validators.required],
      categoryId: ['', Validators.required],
      theshold: ['', Validators.required],
      price: ['', Validators.required],
      cost: ['', Validators.required],
      enabled: [true, Validators.required],
      stock_type: [0, Validators.required],
      supplierCode: ['', Validators.required],
      supplierId: ['', Validators.required],
      description: [''],
      files: [[]],
      amazonCode: [''],
      ebayCode: [''],
      wcCode: [''],
      manomanoCode: [''],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/']);
    }

    // carica categorie
    this.categoryService.getCategories().subscribe((data: any[]) => {
      this.categories = data;
    });

    // carica fornitori
    this.supplierService.getSuppliers().subscribe((data: any[]) => {
      this.suppliers = data;
    });

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Aggiorna prodotto";

        this.productService.getProduct(this.id)
          .subscribe((data: Product) => {
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
              manomanoCode: data.manomanoCode
            });
          });
      }
    });
  }

  returnBack() {
    this.router.navigate(["/products"]);
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
}
