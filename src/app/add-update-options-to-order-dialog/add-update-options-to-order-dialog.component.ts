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
import { AbstractControl, FormArray } from '@angular/forms';

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
    { value: 'm', label: 'Metri' },
    { value: 'pezzi', label: 'Pezzi' },
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

  selectedMap = new Map<string, any>();

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
    console.log(JSON.stringify(this.data));
    
    const p: ProductViewModel = JSON.parse(JSON.stringify(this.data));
    this.title += ": " + p.name;

    // Opzioni di primo livello
    this.masterOptions = p.options.filter(a => !a.parent) || [];

    //console.log(JSON.stringify(this.masterOptions));

    // Crea il form ricorsivo
    
    this.selectedMap = this.buildSelectedMap(p.selectedOptions);

    this.applySelectionsToOptions(this.masterOptions, p.selectedOptions);

    //console.log(this.selectedMap);

    this.form = this.createFormGroupForOptions(this.masterOptions, p.selectedOptions);

    this.initGroupSelection(this.masterOptions, this.form, p.selectedOptions);
  }

  applySelectionsToOptions(options: any[], selectedOptions: any): void {

  if (!options || !selectedOptions) return;

  options.forEach(optionNode => {

    const id = optionNode.option._id;

    const selected = Array.isArray(selectedOptions)
      ? selectedOptions.find((s: any) => s._id === id)
      : selectedOptions;

    if (!selected) return;

    // 🔥 GROUP → costruisci figli subito
    if (optionNode.option.optionType === OptionType.group && selected.value) {

      const selectedChild = selected.value;

      const fullOption = this.data.options.find(o =>
        o.option?._id === selectedChild._id ||
        o._id === selectedChild._id
      );

      if (!fullOption) return;

      const children = this.data.options.filter(o =>
        o.parent?._id === selectedChild._id
      );

      optionNode.children = children.map(c => ({
        option: c.option || c,
        children: []
      }));
    }
    

    // 🔁 ricorsione
    if (optionNode.children?.length && selected.children) {
      this.applySelectionsToOptions(optionNode.children, selected.children);
    }

  });
}

  hasControl(form: FormGroup, id: string): boolean {
    return !!form?.get(id);
  }

  getArray(form: FormGroup, id: string): FormArray {
    return form.get(id) as FormArray;
  }

  getStockTypeLabel(value: string): string {
    const item = this.stockTypes.find(x => x.value === value);
    return item ? item.label : value;
  }

  setGroup(optionNode: any, selectedChild: any): void {
    if (!optionNode || !selectedChild) return;

    const id = optionNode.option._id;

    const findOption = (options: any[]): any => {

      for (const o of options) {

        // 🔹 match root
        if (o.option._id?.toString() === selectedChild._id?.toString())
          return o.option;

        // 🔹 match dentro children del group
        const children = o.option.children || [];

        const foundInChildren = children.find((c: any) =>
          c._id?.toString() === selectedChild._id?.toString()
        );

        if (foundInChildren) return foundInChildren;

        // 🔹 ricorsione su children già trasformati
        if (o.children?.length) {
          const found = findOption(o.children);
          if (found) return found;
        }
      }

      return null;
    };

    const fullOption = findOption(this.data.options);

    //console.log(JSON.stringify(fullOption));

    if (!fullOption) return;

    // 🔥 COSTRUISCI NODO COMPLETO
    const buildNode = (opt: any, visited = new Set<string>()): any => {

      if (!opt?._id) return null;

      if (visited.has(opt._id)) {
        return null; // blocca loop
      }

      visited.add(opt._id);

      const node: any = {
        option: opt,
        children: []
      };

      const children = this.data.options.filter(o =>
        o.parent?._id === opt._id &&
        o._id !== opt._id
      );

      node.children = children
        .map(c => buildNode(c, new Set(visited)))
        .filter(Boolean);

      return node;
    };

    const rootNode = buildNode(fullOption);

    const childrenKey = id + '_children';

    const childForm = this.createFormGroupForOptions(
      [rootNode],
      (this.data as any).selectedOptions
    );

    this.initGroupSelection(
      [rootNode],
      childForm,
      (this.data as any).selectedOptions
    );
    
    const parentForm = this.findParentFormByOptionId(this.form, id);

    if (!parentForm) return;

    if (parentForm.contains(childrenKey)) {
      parentForm.setControl(childrenKey, childForm);
    } else {
      parentForm.addControl(childrenKey, childForm);
    }

    optionNode.children = [rootNode];

    this.cdr.detectChanges();
  }

  private buildSelectedMap(tree: any): Map<string, any> {

  const map = new Map<string, any>();

  const walk = (node: any) => {

    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node._id) {
      map.set(node._id, node);
    }

    // 🔥 importantissimo
    if (node.value) {
      walk(node.value);
    }

    if (node.children) {
      walk(node.children);
    }
  };

  walk(tree);

  return map;
}

  // --- CREA FORM RICORSIVO ---
  createFormGroupForOptions(options: any[], selectedOptions?: any): FormGroup {

    const group: Record<string, AbstractControl> = {};

    options.forEach(optionNode => {

      const id = optionNode.option._id;
      const type = optionNode.option.optionType;

      const childrenKey = id + '_children';

      // 🔥 crea SEMPRE il contenitore figli
      group[childrenKey] = this.fb.group({});

      let selected = null;

      if (Array.isArray(selectedOptions)) {
        selected = selectedOptions.find((s: any) => s._id === id);
      } else if (selectedOptions && selectedOptions._id === id) {
        selected = selectedOptions;
      }

      let initialValue: any = null;
      let qtaValue: number = 1;

      // =========================
      // SELECT
      // =========================
      if (type === OptionType.select) {

        const selectedDeep = this.findSelectedNodeDeep(selectedOptions, id);

        let matchedProduct = null;

        if (selectedDeep?.selectedProduct?._id) {

          matchedProduct =
            optionNode.option.products.find(
              (p: any) => p._id === selectedDeep.selectedProduct._id
            ) || selectedDeep.selectedProduct;

          qtaValue = selectedDeep.selectedProduct?.qta ?? 1;

        } else {

          matchedProduct =
            optionNode.option.products.find((p: any) => p.selected) || null;

          qtaValue = matchedProduct?.quantity ?? 1;
        }

        initialValue = matchedProduct || null;

        optionNode.selectedUnit =
          this.getStockTypeLabel(matchedProduct?.stock_type) || 'Quantità';

        group[id] = new FormControl(initialValue);
        group['qta_' + id] = new FormControl(qtaValue);

        // 🔥 CHILDREN SEMPRE CALCOLATI
        const children = this.data.options.filter(opt =>
          opt.parent?._id === id &&
          (!opt.parentProduct || opt.parentProduct._id === matchedProduct?._id)
        );

        optionNode.children = children || [];

        const selectedDeepMap = this.selectedMap.get(id);

        group[childrenKey] = this.createFormGroupForOptions(
          optionNode.children,
          selectedDeepMap?.children
        );
      }

      // =========================
      // MULTIPRODUCT
      // =========================
      else if (type === OptionType.multiproduct) {

        const productsArray = new FormArray<FormGroup>([]);

        optionNode.option.products.forEach((p: any) => {
          productsArray.push(
            this.fb.group({
              _id: [p._id],
              name: [p.name],
              price: [p.price],
              quantity: [p.quantity ?? 1]
            })
          );
        });

        group[id] = productsArray;

        const children = this.data.options.filter(opt =>
          opt.parent?._id === id
        );

        optionNode.children = children || [];

        const selectedDeepMap = this.selectedMap.get(id);

        group[childrenKey] = this.createFormGroupForOptions(
          optionNode.children,
          selectedDeepMap?.children
        );
      }

      // =========================
      // GROUP
      // =========================
      else if (type === OptionType.group) {

        group[id] = new FormControl(null);

        // 🔥 FIX: figli da parent, NON da option.children
        const children = this.data.options.filter(opt =>
          opt.parent?._id === id
        );

        optionNode.children = children || [];

        const selectedDeepMap = this.selectedMap.get(id);

        group[childrenKey] = this.createFormGroupForOptions(
          optionNode.children,
          selectedDeepMap?.children
        );
      }

      // =========================
      // ALTRI TIPI
      // =========================
      else {

        initialValue =
          selected?.value ??
          optionNode.value ??
          null;

        group[id] = new FormControl(initialValue);

        const selectedDeepMap = this.selectedMap.get(id);

        group[childrenKey] = this.createFormGroupForOptions(
          optionNode.children || [],
          selectedDeepMap?.children
        );
      }

    });

    const fg = new FormGroup(group);

    console.log('📦 FORM GROUP CONTROLS:', Object.keys(fg.controls));

    return fg;
  }

  private findSelectedNodeDeep(tree: any, id: string): any {

    if (!tree) return null;

    if (Array.isArray(tree)) {
      for (const node of tree) {
        const found = this.findSelectedNodeDeep(node, id);
        if (found) return found;
      }
      return null;
    }

    if (tree._id === id) return tree;

    // 🔥 CERCA ANCHE DENTRO value (fondamentale per GROUP)
    if (tree.value) {
      const found = this.findSelectedNodeDeep(tree.value, id);
      if (found) return found;
    }

    if (tree.children) {
      return this.findSelectedNodeDeep(tree.children, id);
    }

    return null;
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
      const selectedDeep = this.selectedMap.get(optionNode.option._id);

      const childForm = this.createFormGroupForOptions(
        optionNode.children,
        selectedDeep?.children
      );
   
    const parentForm = this.findParentFormByOptionId(this.form, optionNode.option._id);

    if (!parentForm) return;

    if (parentForm.contains(childrenKey)) {
      parentForm.setControl(childrenKey, childForm);
    } else {
      parentForm.addControl(childrenKey, childForm);
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
      else if (optionNode.option.optionType === OptionType.multiproduct) {

        const productsFormArray = control as FormArray;

        node.selectedProducts = productsFormArray.controls.map(ctrl => {
          const value = ctrl.value;
          return {
            _id: value._id,
            name: value.name,
            price: value.price,
            qta: value.quantity
          };
        });

      }
      else {
        node.value = control?.value ?? null;
      }

      const childrenControl = currentForm.get(id + '_children') as FormGroup;
      if (optionNode.children && optionNode.children.length > 0 && childrenControl) {
        node.children = this.getFullSelection(optionNode.children, childrenControl);
      }

      //console.log("NODE COSTRUITO:", JSON.stringify(node));

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

  initGroupSelection(options: any[], form: FormGroup, selectedOptions: any): void {

    if (!options || !selectedOptions) return;

    options.forEach(optionNode => {

      const id = optionNode.option._id;
      const type = optionNode.option.optionType;

      let selected = null;

      if (Array.isArray(selectedOptions)) {
        selected = selectedOptions.find((s: any) => s._id === id);
      } else if (selectedOptions && selectedOptions._id === id) {
        selected = selectedOptions;
      }

      // =========================
      // GROUP
      // =========================
      if (type === OptionType.group && selected?.value) {

        const selectedChild = selected.value;

        const realChild = optionNode.option.children.find(
          (c: any) => c._id === selectedChild._id
        );

        if (realChild) {

          form.get(id)?.setValue(realChild);

          this.setGroup(optionNode, realChild);

          setTimeout(() => {

            const parentForm = this.findParentFormByOptionId(this.form, id);
            const childForm = parentForm?.get(id + '_children') as FormGroup;

            const selectedDeep = this.selectedMap.get(id);

            if (!childForm || !selectedDeep) return;

            // 🔥 CASO CHILDREN (select annidate)
            if (Array.isArray(selectedDeep.children)) {

              selectedDeep.children.forEach((child: any) => {

                const ctrl = childForm.get(child._id);
                if (!ctrl) return;

                const optionNodeChild = optionNode.children.find((c: any) =>
                  c.option._id === child._id
                );

                const realProduct =
                  optionNodeChild?.option?.products?.find((p: any) =>
                    p._id === child?.selectedProduct?._id
                  );

                if (realProduct) {
                  ctrl.setValue(realProduct);
                }
              });
            }

            // 🔥 CASO INPUT (tipo "ciao")
            if (!Array.isArray(selectedDeep.children) && selectedDeep.value !== undefined) {

              const ctrl = childForm.get(selectedDeep._id);

              if (ctrl) {
                ctrl.setValue(selectedDeep.value);
              }
            }

            this.cdr.detectChanges();

          });
        }
      }

      // =========================
      // INPUT / TEXT / ETC
      // =========================
      if (
        type !== OptionType.group &&
        type !== OptionType.select &&
        type !== OptionType.multiproduct
      ) {
        if (selected?.value !== undefined) {
          const ctrl = form.get(id);
          if (ctrl) {
            ctrl.setValue(selected.value);
          }
        }
      }

      // =========================
      // RICORSIONE
      // =========================
      const childForm = form.get(id + '_children') as FormGroup;

      if (optionNode.children?.length && childForm) {

        const selectedDeep = this.selectedMap.get(id);

        this.initGroupSelection(
          optionNode.children,
          childForm,
          selectedDeep?.children
        );
      }

    });
  }

  findParentFormByOptionId(form: FormGroup, optionId: string): FormGroup | null {

    // 👉 se il form contiene il control principale, è quello giusto
    if (form.contains(optionId)) return form;

    for (const key of Object.keys(form.controls)) {

      const ctrl = form.get(key);

      if (ctrl instanceof FormGroup) {
        const found = this.findParentFormByOptionId(ctrl, optionId);
        if (found) return found;
      }

      if (ctrl instanceof FormArray) {
        for (const c of ctrl.controls) {
          if (c instanceof FormGroup) {
            const found = this.findParentFormByOptionId(c, optionId);
            if (found) return found;
          }
        }
      }
    }

    return null;
  }
}
