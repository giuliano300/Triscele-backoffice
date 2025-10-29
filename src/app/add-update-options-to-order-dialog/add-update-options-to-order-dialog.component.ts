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
import { OptionsService } from '../services/Options.service';
import { MatSelect } from '@angular/material/select';
import { ProductOptions } from '../interfaces/productOptions';
import { ProductUp } from '../interfaces/productsUp';

@Component({
  selector: 'app-update-options-to-order-dialog',
  templateUrl: './add-update-options-to-order-dialog.component.html',
  styleUrls: ['./add-update-options-to-order-dialog.component.scss'],
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
export class AddUpdateOptionsToOrderDialogComponent {
  
  title: string = "Configura il prodotto";

  form: FormGroup;

  masterOptions: any[] = [];

  products: ProductUp[] = [];

  haveFirstOption: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddUpdateOptionsToOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[],
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
      this.masterOptions = data;
    });
  }

  ngOnInit(): void {

    console.log(this.data);

    this.masterOptions = this.data.filter(a => a.parent == null) || [];

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

  }

  selectProductsOption(c: any){
   
 }

 setSubOption(c: any){
  
 }

}
