import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { ProductService } from '../services/Product.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProductViewModel } from '../classess/productViewModel';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { Options } from '../interfaces/options';
import { OptionsService } from '../services/Options.service';
import { ProductUp } from '../interfaces/productsUp';
import { OptionType, OptionTypeLabels } from '../enum/enum';
import { MatSelect } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-update-products-options-dialog',
  templateUrl: './add-update-products-options-dialog.component.html',
  styleUrls: ['./add-update-products-options-dialog.component.scss'],
  standalone:true,
  imports: [
    MatAutocompleteModule,
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
   MatSelect,
   MatCheckboxModule
  ]
})
export class AddUpdateProductsOptionsDialogComponent {
  
  title: string = "Aggiungi opzione prodotti";

  optionForm: FormGroup;

  selectedProducts: any[] = [];
  productCtrl = new FormControl('');
  filteredProducts!: Observable<any[]>;

  products: ProductViewModel[] = [];

  productOptions: Options[] = [];

  OptionTypeLabels = OptionTypeLabels;

  isSelect: boolean = false;

  productOptionsValue: ProductUp[] = [];

  OptionType = OptionType;

  constructor(public dialogRef: MatDialogRef<AddUpdateProductsOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Options,
    private fb: FormBuilder,
    private productService: ProductService,
    private dialog: MatDialog,
    private optionsService: OptionsService
  ) {
    this.optionForm = this.fb.group({
      name: ['', Validators.required],
      layer: [''],
      optionType: [0, Validators.required],
      products: this.fb.array([])
    });
  }

  get optionTypeKeys(): (keyof typeof OptionType)[] {
    return Object.keys(OptionTypeLabels) as (keyof typeof OptionType)[];
  }

  get productsForm() {
    return this.optionForm.get('products') as FormArray;
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

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica opzione prodotti";
      this.optionForm.patchValue({
        name: this.data.name,
        layer: this.data.layer,
        optionType: this.data.optionType
      });
      if(this.data.optionType == OptionType.select)
        this.isSelect = true;

      this.data.products!.forEach((product) => {
        const group = this.fb.group({
          _id: [product._id],
          name: [product.name],
          price: [product.price || 0],
          stock_type :  [product.stock_type || undefined],
          quantity: [product.quantity || 1],
          selected: [product.selected || false]
        });

        this.productsForm.push(group);    
      });

    }

    this.filteredProducts = this.productCtrl.valueChanges.pipe(
      debounceTime(300), 
      switchMap(value => {
        if (value && value.length >= 2) 
          return this.productService.getProductsByName(value); 
        else 
          return of([]); 
      })
    );
  }

  onSave() {
    if (this.optionForm.valid) {
      const result: Options = {
        ...this.data!,
        ...this.optionForm.value
      };

      //result.parentId = this.data.parentId ?? undefined;
      //result.parentProductId = this.data.parentProductId ?? undefined;
      
      //console.log(result);

      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

  removeThis(index: number) {
    const item = this.productsForm.at(index);
    if (!item) return; // sicurezza

    // Rimuovi l’elemento principale
    this.productsForm.removeAt(index);
    
 }

  addProductToList(product: ProductViewModel) {

    const exists = this.productsForm.controls.some(ctrl => {
      const group = ctrl as FormGroup;
      return group.get('_id')?.value === product.id;
    });

    if (exists) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: "Prodotto già inserito",
          message: "Attenzione, hai già inserito questo prodotto nell'opzione."
        },
        width: '500px'
      });

      this.productCtrl.setValue('');
      return;
    }

    const group = this.fb.group({
      _id: [product.id],
      name: [product.name],
      price: [product.price],
      stock_type: [product.stock_type],
      quantity: [1, [Validators.required, Validators.min(1)]],
      selected: [false]
    });

    this.productsForm.push(group);
    this.productCtrl.setValue('');
  }

  changeType(c:any){
    if(c.value == OptionType.select)
      this.isSelect = true;
    else
      this.isSelect = false;
  }
}
