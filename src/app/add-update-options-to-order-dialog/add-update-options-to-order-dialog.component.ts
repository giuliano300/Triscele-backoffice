import { Component, Inject, LOCALE_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FeathericonsModule } from '../icons/feathericons/feathericons.module';
import { OptionsService } from '../services/Options.service';
import { Product } from '../interfaces/products';
import { OptionType } from '../enum/enum';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { ConfigProductToOrder } from '../interfaces/config-product-to-order';
import { ProductViewModel } from '../classess/productViewModel';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: { dateInput: 'dd/MM/yyyy', monthYearLabel: 'MMMM yyyy', dateA11yLabel: 'dd MMMM yyyy', monthYearA11yLabel: 'MMMM yyyy' }
};

@Component({
  selector: 'app-update-options-to-order-dialog',
  templateUrl: './add-update-options-to-order-dialog.component.html',
  styleUrls: ['./add-update-options-to-order-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCard, MatCardContent,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule,
    FeathericonsModule, MatDialogActions, MatDatepickerModule,
    MatNativeDateModule, ColorPickerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class AddUpdateOptionsToOrderDialogComponent implements OnInit {

  title: string = "Configura il prodotto";
  masterOptions: any[] = [];
  OptionType = OptionType;
  form: FormGroup;

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
    public dialogRef: MatDialogRef<AddUpdateOptionsToOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private fb: FormBuilder,
    private optionService: OptionsService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    const p: ProductViewModel = JSON.parse(JSON.stringify(this.data));
    this.title += ": " + p.name;

    // Opzioni di primo livello
    this.masterOptions = p.options.filter(a => !a.parent) || [];

    //console.log(JSON.stringify(this.masterOptions));

    // Crea il form ricorsivo
    this.form = this.createFormGroupForOptions(this.masterOptions, p.selectedOptions);
  }

  getStockTypeLabel(value: string): string {
    const item = this.stockTypes.find(x => x.value === value);
    return item ? item.label : value;
  }

  // --- CREA FORM RICORSIVO ---
  createFormGroupForOptions(options: any[], selectedOptions?: any[]): FormGroup {
    const group: any = {};
    const flatSelected = selectedOptions && selectedOptions.length > 0 ? selectedOptions[0] : [];

    options.forEach(optionNode => {
      const id = optionNode.option._id;
      const type = optionNode.option.optionType;

      const selected = flatSelected.find((s: any) => s._id === id);
      let initialValue: any = null;

      if (selected) {
        if (type === OptionType.select) {
          const selectedId = selected.selectedProduct?._id || selected.value?._id;
          const matched = optionNode.option.products.find((p: any) => p._id === selectedId);
          initialValue = matched || null;
          
          optionNode.selectedUnit = this.getStockTypeLabel(selected.selectedProduct.stock_type) || 'Quantità';


          // POPOLA I CHILDREN ALL'INIZIALIZZAZIONE
          const children = this.data.options.filter(opt =>
            opt.parent?._id === id &&
            (!opt.parentProduct || opt.parentProduct._id === matched?._id)
          );

          if (children.length > 0) {
            optionNode.children = children;
            group[id + '_children'] = this.createFormGroupForOptions(children, selectedOptions);
          }
        } 
        else 
        {
          initialValue = selected.value ?? null;
        }
      } else {
        initialValue = type === OptionType.select ? optionNode.selectedProduct || null : optionNode.value || null;
      }

      // FormControl
      group[id] = new FormControl(initialValue);

      if (type === OptionType.select) {
        const qtaValue = selected?.selectedProduct?.qta ?? 1;
        group['qta_' + id] = new FormControl(qtaValue);
        
      }

      // Figli ricorsivi
      if (optionNode.children && optionNode.children.length > 0) {
        group[id + '_children'] = this.createFormGroupForOptions(optionNode.children, selectedOptions);
      }
    });

    return new FormGroup(group);
  }

  // --- COMPARA OGGETTI PER SELECT ---
  compareProducts(p1: any, p2: any): boolean {
    return p1 && p2 ? p1._id === p2._id : p1 === p2;
  }

  // --- SETTA SELEZIONE DI UNA OPTION E GESTISCE FIGLI ---
  setSubOption(optionNode: any, selectedProduct: any): void {
    if (!optionNode || !selectedProduct) return;

    optionNode.selectedProduct = selectedProduct;

    optionNode.selectedUnit = this.getStockTypeLabel(selectedProduct.stock_type) || 'Quantità';

    // Trova figli validi
    const children = this.data.options.filter(opt =>
      opt.parent?._id === optionNode.option._id &&
      (!opt.parentProduct || opt.parentProduct._id === selectedProduct._id)
    );

    // assegniamo un nuovo array così Angular rileva il cambiamento
    optionNode.children = [...children];

    const childrenKey = optionNode.option._id + '_children';

    if (optionNode.children.length > 0) {
      const childForm = this.createFormGroupForOptions(optionNode.children);
      if (this.form.contains(childrenKey)) {
        this.form.setControl(childrenKey, childForm);
      } else {
        this.form.addControl(childrenKey, childForm);
      }
    } else {
      if (this.form.contains(childrenKey)) {
        this.form.removeControl(childrenKey);
      }
    }

    this.cdr.detectChanges(); // forza Angular a ricalcolare il template
  }

  // --- RITORNA L'ALBERO COMPLETO DELLA CONFIG ---
  getFullSelection(options: any[], formGroup?: FormGroup): any[] {
    const currentForm = formGroup || this.form;

    return options.map(optionNode => {
      const id = optionNode.option._id;
      const control = currentForm.get(id);
      const qtaControl = currentForm.get('qta_' + id);

      const node: any = {
        _id: id,
        name: optionNode.option.name,
        selectedProduct: null,
        value: null
      };

      if (optionNode.option.optionType === OptionType.select) {
        const selectedProduct = control?.value || null;
        const qtaValue = qtaControl?.value ?? 1;

        // Inserisce la quantità nel selectedProduct
        node.selectedProduct = selectedProduct
          ? { ...selectedProduct, qta: qtaValue }
          : null;
      } 
      else {
        node.value = control?.value ?? null;
      }

      const childrenControl = currentForm.get(id + '_children') as FormGroup;
      if (optionNode.children && optionNode.children.length > 0 && childrenControl) {
        node.children = this.getFullSelection(optionNode.children, childrenControl);
      }

      return node;
    });
  }

  // --- SAVE E CLOSE ---
  onSave(): void {
    if (this.form.valid) {
      const fullTree: ConfigProductToOrder[] = this.getFullSelection(this.masterOptions);
      //console.log(fullTree);
      this.dialogRef.close(fullTree);
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  getChildrenArray(optionNode: any, parentForm: FormGroup): any[] {
    const childrenControl = parentForm.get(optionNode.option._id + '_children') as FormGroup;
    if (!childrenControl) return [];
    // Trasformiamo il FormGroup dei figli in array di oggetti
    return optionNode.children || [];
  }
}
