import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ProductService } from '../../services/Product.service';
import { ProductViewModel } from '../../classess/productViewModel';
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatLabel, MatFormField } from "@angular/material/form-field";
import { MatSelect } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Categories } from '../../interfaces/categories';
import { Supplier } from '../../interfaces/suppliers';
import { SupplierService } from '../../services/Supplier.service';
import { CategoryService } from '../../services/Category.service';

@Component({
  selector: 'app-products',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FeathericonsModule,
    MatLabel,
    MatSelect,
    MatOptionModule,
    MatFormField,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  Products: ProductViewModel[] = [];

  displayedColumns: string[] = [
    'name',
    'category',
    'supplier',
    'supplierCode',
    'internalCode',
    'price',
    'cost',
    'stock',
    'enabled',
    'edit',
    'delete'
  ];

  form: FormGroup;

  dataSource = new MatTableDataSource<ProductViewModel>(this.Products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  categories: Categories[] = [];
  suppliers: Supplier[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) 
  { 
    this.form = this.fb.group({
      categoryId: [],
      supplierId: []
    });
  }


  ngOnInit(): void {
    this.getProducts();
     this.supplierService.getSuppliers()
      .subscribe((data: Supplier[]) => {
        this.suppliers = data;
      });
     this.categoryService.getCategories()
      .subscribe((data: Categories[]) => {
        this.categories = data;
      });
  }

  onSubmit(){
    const { categoryId, supplierId } = this.form.value;
    this.getProducts(categoryId, supplierId);
  }
  getProducts(categoryId?: string, supplierId?: string) {
    let query = '';
    if (categoryId || supplierId) {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (supplierId) params.append('supplierId', supplierId);
      query = `?${params.toString()}`;
    }
    this.productService.getProducts(query)
      .subscribe((data: ProductViewModel[]) => {
        if (!data || data.length === 0) {
            this.dataSource.data = [];
            this.dataSource.paginator = this.paginator;        
        } else {
          this.Products = data.map(p => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              delete: 'ri-delete-bin-line'
            }
          }));
          this.dataSource = new MatTableDataSource<ProductViewModel>(this.Products);
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  DeleteItem(item: ProductViewModel) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.productService.delete(item!.id!)
          .subscribe((data: boolean) => {
            if (data) {
              this.getProducts();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: ProductViewModel) {
    this.router.navigate(["/product/add/" + item.id]);
  }

  getEnabledStatus(enabled: boolean): string {
    return enabled ? "Attivo" : "Disattivo";
  }
}
