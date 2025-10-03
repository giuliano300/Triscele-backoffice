import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOption } from "@angular/material/core";
import { MatSelect } from '@angular/material/select';
import { ProductViewModel } from '../classess/productViewModel';
import { ProductService } from '../services/Product.service';
import { SubProducts } from '../interfaces/subProducts';

@Component({
  selector: 'app-update-sub-product-dialog',
  templateUrl: './add-update-sub-product-dialog.component.html',
  styleUrls: ['./add-update-sub-product-dialog.component.scss'],
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
    MatSelect
]
})
export class AddUpdateSubProductsDialogComponent {
  
  title: string = "Aggiungi sotto prodotto";

  form: FormGroup;

  suppliers: any[] = [];

  stock_type: string = "";

  products: ProductViewModel[] = [];

  selectedProduct?: ProductViewModel;

  constructor(public dialogRef: MatDialogRef<AddUpdateSubProductsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  SubProducts,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      quantity: [null, Validators.required],
      price: [null, Validators.required],
      productId: [null, Validators.required]
    });
  }

  getProducts() {
    this.productService.getProducts()
      .subscribe((data: ProductViewModel[]) => {
        if (!data || data.length === 0) 
            this.onClose();  
        else
        {
          this.products = data;
          if(this.data)
            this.selectedProduct = this.products.find(a => a.id == this.data.productId)!;
        }
      });
  }
  
  selectProduct(id: any){
    if(!id)
      return;

    this.selectedProduct = this.products.find(a => a.id == id);
    this.form.patchValue({
      name: this.selectedProduct!.name,
      quantity: 1,
      price: this.selectedProduct?.price
    });
  }

  ngOnInit(): void {
    this.getProducts();
    if(this.data){
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
      result.supplierName = this.selectedProduct?.supplier?.businessName!;
      
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
