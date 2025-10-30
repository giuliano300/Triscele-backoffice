import { Component, Inject, LOCALE_ID  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FeathericonsModule } from '../icons/feathericons/feathericons.module';
import { OptionsService } from '../services/Options.service';
import { ProductOptions } from '../interfaces/productOptions';
import { Product } from '../interfaces/products';
import { OptionType } from '../enum/enum';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { ConfigProductToOrder } from '../interfaces/config-product-to-order';

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
  selector: 'app-update-options-to-order-dialog',
  templateUrl: './add-update-options-to-order-dialog.component.html',
  styleUrls: ['./add-update-options-to-order-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FeathericonsModule,
    MatDialogActions,
    MatDatepickerModule,
    MatNativeDateModule,
    ColorPickerModule 
  ],
  providers: [
      provideNativeDateAdapter(),
      { provide: LOCALE_ID, useValue: 'it-IT' },
      { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
    ],
})
export class AddUpdateOptionsToOrderDialogComponent {

  title: string = "Configura il prodotto";
  masterOptions: any[] = [];

  OptionType = OptionType;

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddUpdateOptionsToOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private fb: FormBuilder,
    private optionService: OptionsService
  ) 
  {
    this.form = this.fb.group({});
  }

  createFormGroupForOptions(options: any[]): FormGroup {
  const group: any = {};

  options.forEach(optionNode => {
    // FormControl per la selezione del prodotto
    group[optionNode.option._id] = new FormControl(optionNode.selectedProduct || null);

    // Se ha figli, crea FormGroup ricorsivo
    if (optionNode.children && optionNode.children.length > 0) {
      group[optionNode.option._id + '_children'] = this.createFormGroupForOptions(optionNode.children);
    }
  });

  return this.fb.group(group);
}

  ngOnInit(): void {
    const p: Product = JSON.parse(JSON.stringify(this.data));

    console.log(p.options);

    this.title += ": " + p.name;

    // Copia profonda dei dati originali
    const dataCopy: ProductOptions[] = p.options;

    // Prendi solo le opzioni di primo livello
    this.masterOptions = dataCopy.filter(a => !a.parent) || [];

    // Crea il form ricorsivo pulito
    this.form = this.createFormGroupForOptions(this.masterOptions);
  }

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

  setSubOption(optionNode: any, selectedProduct: any): void {
    if (!optionNode || !selectedProduct) return;

    // Salva la selezione nel nodo stesso
    optionNode.selectedProduct = selectedProduct;

    // Trova figli
    const children = this.data.options.filter(opt => {
      const isChildOfParent = opt.parent?._id === optionNode.option._id;
      const matchesParentProduct = !opt.parentProduct || opt.parentProduct._id === selectedProduct._id;
      return isChildOfParent && matchesParentProduct;
    });

    optionNode.children = children || [];

    // Aggiorna il form ricorsivo
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
  }

  getFullSelection(options: any[]): any[] {
    return options.map(optionNode => {
      const node: any = {
        _id: optionNode.option._id,
        name: optionNode.option.name,
        // selezione prodotto (mat-select)
        selectedProduct: optionNode.selectedProduct || null,
        // valore input / textarea / colore / date
        value: optionNode.value || null
      };

      if (optionNode.children && optionNode.children.length > 0) {
        node.children = this.getFullSelection(optionNode.children);
      }

      return node;
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value ?? '';
  }

  onColorChange(event: Event, optionNode: any): void {
    const color = (event.target as HTMLInputElement).value;
    optionNode.selectedColor = color;
  }
  
}
