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
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { exceedsLimit, maxLenghtUploadFile } from '../../../../main';
import { AlertDialogComponent } from '../../../alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImageDialogComponent } from '../../../image-dialog/image-dialog.component';
import { ProductViewModel } from '../../../classess/productViewModel';

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
    FeathericonsModule,
    NgxFileDropModule,
    MatIconModule
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

  uploadedFiles: { name: string, base64: string }[] = [];

  rejectedFiles: { name: string; reason: string }[] = [];

  dropZoneIsDisabled = false;
  
  exceedsLimit: number = 3;

  dismissTimeout: any;

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

  openedImage: string | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private dialog: MatDialog
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
      stock: [0, Validators.required],
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
          .subscribe((data: ProductViewModel) => {
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
              manomanoCode: data.manomanoCode,
              stock: data.stock
            });

            const uploadFilesJson = data.files!;
            this.uploadedFiles = uploadFilesJson ? uploadFilesJson : [];
            if(this.uploadedFiles.length >= maxLenghtUploadFile)
              this.dropZoneIsDisabled = true;
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

      formData.files = this.uploadedFiles;

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


  onFileDrop(files: NgxFileDropEntry[]) {

    if(this.uploadedFiles.length >= maxLenghtUploadFile){
      this.dropZoneIsDisabled = true;
      this.openAlertDialog();
      return;
    }

    let stopProcessing = false;

    for (const droppedFile of files) {
      if (stopProcessing) return;

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file(file => {
          if (stopProcessing) return;

          if (file.size > exceedsLimit * 1024 * 1024) {
            this.rejectedFiles.push({
              name: file.name,
              reason: 'File eccede il limite di ' + exceedsLimit + ' MB'
            });
          } else {
            const reader = new FileReader();
            reader.onload = () => {
              if (stopProcessing) return;

              if (this.uploadedFiles.length >= maxLenghtUploadFile) {
                this.dropZoneIsDisabled = true;
                this.openAlertDialog();
                stopProcessing = true;
                return;
              }

              const base64 = (reader.result as string).split(',')[1];
              this.uploadedFiles.push({
                name: file.name,
                base64: base64
              });

              // Dopo il push, controlliamo ancora
              if (this.uploadedFiles.length >= maxLenghtUploadFile) {
                this.dropZoneIsDisabled = true;
                this.openAlertDialog();
                stopProcessing = true;
              }
            };

            reader.readAsDataURL(file);
          }
        });
      }
    }    
    
    setTimeout(() => {
        this.rejectedFiles = [];
      }, 5000);
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
    if(this.uploadedFiles.length < maxLenghtUploadFile)
      this.dropZoneIsDisabled = false;
  }

  
  openAlertDialog(): void {
    this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Completato',
        message: 'Hai raggiunto il massimo di ' + maxLenghtUploadFile + ' files che puoi caricare.'
      }
    });
  }

  dismissRejectedFiles() {
    clearTimeout(this.dismissTimeout);
    this.rejectedFiles = [];
  }

  downloadFile(file: { name: string, base64: string }) {
    const byteCharacters = atob(file.base64);
    const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

    // Funzione per aprire una foto
  openImage(file: { name: string; base64: string }) {
    this.openedImage = 'data:image/png;base64,' + file.base64;
  }

  // Funzione per chiudere la foto
  closeImage() {
    this.openedImage = null;
  }


}
