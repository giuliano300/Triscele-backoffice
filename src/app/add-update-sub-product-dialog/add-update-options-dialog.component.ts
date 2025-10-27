import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldControl, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOption } from "@angular/material/core";
import { ProductViewModel } from '../classess/productViewModel';
import { ProductService } from '../services/Product.service';
import { SubProducts } from '../interfaces/subProducts';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { MatAutocomplete, MatAutocompleteModule } from "@angular/material/autocomplete";

@Component({
  selector: 'app-update-options-dialog',
  templateUrl: './add-update-options-dialog.component.html',
  styleUrls: ['./add-update-options-dialog.component.scss'],
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
    MatAutocomplete,
    MatAutocompleteModule
]
})
export class AddUpdateOptionsDialogComponent {
  
  title: string = "Aggiungi sotto prodotto";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  products: ProductViewModel[] = [];

  selectedProduct?: any;

  isAdd: boolean = true;

  productCtrl = new FormControl('');
  filteredProducts!: Observable<any[]>;
  

  constructor(public dialogRef: MatDialogRef<AddUpdateOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  SubProducts,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      type: [''],
      name: ['', Validators.required],
      quantity: [null, Validators.required],
      price: [null, Validators.required],
      productId: [null, Validators.required]
    });
  }
  selectProduct(product: any){
    if(!product)
      return;

    this.selectedProduct = product;

    this.displayProduct(product.name);
    this.form.patchValue({
      name: product!.name,
      quantity: 1,
      price: product?.price,
      productId: product!.id
    });
  }

  displayProduct(product: any): string {
    return product ? product.name : '';
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
    )

    if(this.data){
      this.isAdd = false;
      this.selectedProduct = this.data;
      this.form.patchValue({
        name: this.data.name,
        quantity: this.data.quantity,
        price: this.data.price,
        productId: this.data.productId
      });

    }
  }

  onSave() {
    if (this.form.valid) {
      const result: SubProducts = {
        ...this.form.value
      };

      if(this.data)
        result.type = "upd";
      else
        result.type = "add";

      result.internalCode = this.selectedProduct?.internalCode!;
      result.supplierCode = this.selectedProduct?.supplierCode!;
      result.supplierName = this.selectedProduct?.supplierName!;
      
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
