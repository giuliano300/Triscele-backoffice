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
import { AddMovementComponent } from '../../add-movement-dialog/add-movement-dialog.component';
import { ProductMovementsService } from '../../services/Product-movements.service';
import { ProductMovements } from '../../interfaces/productMovements';
import { MovementsComponent } from '../../movements-dialog/movements-dialog.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInput } from "@angular/material/input";
import { MatTooltipModule } from '@angular/material/tooltip';

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
    FormsModule,
    MatSortModule,
    MatInput,
    MatTooltipModule
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
    'theshold',
    'stock',
    'enabled',
    'edit',
    'movements',
    'delete'
  ];

  form: FormGroup;

  dataSource = new MatTableDataSource<ProductViewModel>(this.Products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories: Categories[] = [];
  suppliers: Supplier[] = [];

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private productMovementsService: ProductMovementsService
  ) 
  { 
    this.form = this.fb.group({
      categoryId: [],
      supplierId: [],
      name: []
    });
  }


  ngOnInit(): void {
    //this.getProducts();
     this.supplierService.getSuppliers()
      .subscribe((data: Supplier[]) => {
        this.suppliers = data;
      });
     this.categoryService.getCategories()
      .subscribe((data: Categories[]) => {
        this.categories = data;
      });
  }

  ngAfterViewInit() {
    // Chiamata iniziale
    this.getProducts();

    // Evento cambio pagina
    this.paginator.page.subscribe(() => {
      this.getProducts(
        this.form.value.categoryId,
        this.form.value.supplierId,
        this.form.value.name,
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  onSubmit(){
    const { categoryId, supplierId, name } = this.form.value;
    this.getProducts(categoryId, supplierId, name);
  }

  remove(){
    this.getProducts();
    this.form.patchValue({
      categoryId: [],
      supplierId: [],
      name: []
    });
  }

  getProducts(categoryId?: string, supplierId?: string, name?: string, pageIndex: number = 0, pageSize: number = 20) {
    let query = '';
    const params = new URLSearchParams();
    params.append('page', (pageIndex + 1).toString()); 
    params.append('limit', pageSize.toString());
    if (categoryId) params.append('categoryId', categoryId);
    if (supplierId) params.append('supplierId', supplierId);
    if (name) params.append('name', name);
    query = `?${params.toString()}`;

    this.productService.getProducts(query)
      .subscribe((response: any) => {
          const data = response.data || [];
          this.totalItems = response.total;
          this.pageSize = response.limit;
          this.pageIndex = response.page - 1;

          this.Products = data.map((p: any) => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              movements: 'ri-search-line',
              delete: 'ri-delete-bin-line'
            }
          }));

          this.dataSource = new MatTableDataSource<ProductViewModel>(this.Products);
          this.dataSource.sort = this.sort;
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

  ShowMovements(item: ProductViewModel){
    const dialogRef = this.dialog.open(MovementsComponent, {
      data: item,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(result);
      if (result) {
        this.productMovementsService.setProductMovements(result)
          .subscribe((data: ProductMovements) => {
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

  addMovements(item: ProductViewModel){
    const dialogRef = this.dialog.open(AddMovementComponent, {
      data: item,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(result);
      if (result) {
        this.productMovementsService.setProductMovements(result)
          .subscribe((data: ProductMovements) => {
            if (data) {
              this.getProducts();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }
}
