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
import { SubProducts } from '../interfaces/subProducts';
import {  Observable } from 'rxjs';
import { Options } from '../interfaces/options';
import { OptionsService } from '../services/Options.service';
import { MatSelect } from '@angular/material/select';
import { ProductOptions } from '../interfaces/productOptions';
import { ProductUp } from '../interfaces/productsUp';

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
    MatSelect
]
})
export class AddUpdateOptionsDialogComponent {
  
  title: string = "Aggiungi ozione al prodotto";

  form: FormGroup;


  options: Options[] = [];
  optionsExcluded: Options[] = [];

  products: ProductUp[] = [];

  constructor(public dialogRef: MatDialogRef<AddUpdateOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  ProductOptions,
    private fb: FormBuilder,
    private optionService: OptionsService
  ) {
    this.form = this.fb.group({
      option: [null, Validators.required],
      position: [0, Validators.required],
      parent: [null],
      parentProduct: [null]
    });
  }

  getProductsOptions(){
    this.optionService.getOptions()
    .subscribe(data => {
      this.options = data;
    });
  }

ngOnInit(): void {
  this.optionService.getOptions()
    .subscribe(data => {
      this.options = data || [];

      if (this.data) {
        const foundOption = this.options.find(o =>
          o._id?.toString() === this.data.option?._id?.toString()
        ) ?? null;

        const foundParent = this.options.find(o =>
          o._id?.toString() === this.data.parent?._id?.toString()
        ) ?? null;

        this.optionsExcluded = this.options.filter(a =>
          a._id?.toString() !== (foundOption?._id?.toString() ?? '')
        );

        this.products = this.options
          .filter(a => a._id?.toString() === this.data.parent?._id?.toString())
          .flatMap(p => p.products || []);
          
        const foundProduct = this.products.find(o =>
          o._id?.toString() === this.data.parentProduct?._id?.toString()
        ) ?? null;

        this.form.patchValue({
          option: foundOption,
          position: this.data.position,
          parent: foundParent,
          parentProduct: foundProduct
        });

      } 
      else 
      {
        this.optionsExcluded = [...this.options];
      }
  });
}

  onSave() {
    if (this.form.valid) {
      const result: ProductOptions = {
        ...this.form.value
      };

      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

  selectOtherOptions(c: any){
    this.optionsExcluded = this.options.filter(a => a._id?.toString() !== c.value._id?.toString());
  }

  selectProductsOption(c: any){
    this.products = this.optionsExcluded
      .filter(a => a._id?.toString() === c.value._id?.toString())
      .flatMap(p => p.products || []);
 }

}
