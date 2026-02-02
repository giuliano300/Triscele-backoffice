import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOption } from "@angular/material/core";
import { MatSelect } from '@angular/material/select';
import { ProductViewModel } from '../classess/productViewModel';
import { MovementType } from '../enum/enum';
import { ProductMovements } from '../interfaces/productMovements';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { MatAutocomplete, MatAutocompleteModule } from "@angular/material/autocomplete";
import { ProductService } from '../services/Product.service';

@Component({
  selector: 'app-general-movement-dialog',
  templateUrl: './add-general-movement-dialog.component.html',
  styleUrls: ['./add-general-movement-dialog.component.scss'],
  standalone:true,
  imports: [
    MatDialogModule,
    MatCardContent,
    MatCard,
    MatFormField,
    MatFormFieldModule,
    FeathericonsModule,
    MatInputModule,
    MatIconModule,
    MatLabel,
    CommonModule,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatAutocomplete,
    MatAutocompleteModule
]
})
export class AddGeneralMovementComponent {
  
  title: string = "Aggiungi movimentazione";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  movementType: any[] = MovementType

  selectedProducts: any[] = [];
  productCtrl = new FormControl('');
  filteredProducts!: Observable<any[]>;

  products: ProductViewModel[] = [];
  product: any | undefined;
  
  constructor(public dialogRef: MatDialogRef<AddGeneralMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductViewModel,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      movementType: [null, Validators.required],
      stock: [null, Validators.required],
      productId: [null, Validators.required],
      supplierCode: [''],
      supplierId: [''],
      supplierName: ['']
    });

  }

  get productsForm() {
      return this.form.get('products') as FormArray;
  }
  

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

  addProduct(product: any){
    this.product = product;

    this.stock_type = this.product!.stock_type!;

    this.productCtrl.setValue(product.name!);
    this.form.patchValue({
      productId: this.product!.id!,
      supplierCode: this.product?.supplierCode,
      supplierId: this.product?.supplierId,
      supplierName: this.product?.supplierName
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

    this.form.patchValue({
      //productId: this.data.id!
    });
  }

  onSave() {
    if (this.form.valid) {
      const result: ProductMovements = {
        ...this.form.value,
        productName: this.product.name,
        stock_type: this.stock_type
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
