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
import { MovementType } from '../../enum/enum';
import { AddGeneralMovementComponent } from '../../add-general-movement-dialog/add-general-movement-dialog.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { finalize, forkJoin, tap } from 'rxjs';
import { AddDuplicateProductComponent } from '../../add-duplicate-product-dialog/add-duplicate-product-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ProductsState } from '../../interfaces/products-state';

export interface AlertMessage {
  id: number;
  description: string;
}

const PRODUCTS_STATE_KEY = 'products_state';

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
    MatTooltipModule,
    MatProgressBar
],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})

export class ProductsComponent {

  Products: ProductViewModel[] = [];

  readonly ALL_COLUMNS: string[] = [
    'name',
    'category',
    'supplier',
    'supplierCode',
    'theshold',
    'stock',
    'duplicate',
    'edit',
    'movements',
    'delete'
  ];

  displayedColumns: string[] = [];
  
  form: FormGroup;

  dataSource = new MatTableDataSource<ProductViewModel>(this.Products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories: Categories[] = [];
  suppliers: Supplier[] = [];

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;

  firstLoading: boolean = false;

  text: string = "";
  showStock: boolean = false;

  lowStock: ProductViewModel[] = [];

  show:boolean = false;

  description: string = "";

  visible = false;

  currentSortField: string = '_id';
  currentSortDirection: 'asc' | 'desc' = 'desc';

  alerts: AlertMessage[] = [];
  private alertId = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private productMovementsService: ProductMovementsService,
    private toastr: ToastrService
  ) 
  { 
    this.form = this.fb.group({
      categoryId: [],
      supplierId: [],
      name: []
    });
  }

  findLowStock(){
    this.productService.findLowStock().subscribe((data) => {
      this.lowStock = data;
      this.checkStockLevels();
    });
   }


  ngOnInit(): void {

    const cached = sessionStorage.getItem(PRODUCTS_STATE_KEY);

     if (cached) {
        const state: ProductsState = JSON.parse(cached);

        this.form.patchValue(state.filters);
        this.pageIndex = state.pageIndex;
        this.pageSize = state.pageSize;
        this.currentSortField = state.sortField;
        this.currentSortDirection = state.sortDirection;
        this.show = state.show;
     }

     this.supplierService.getSuppliers()
      .subscribe((data: Supplier[]) => {
        this.suppliers = data;
      });
     this.categoryService.getCategories()
      .subscribe((data: Categories[]) => {
        this.categories = data;
      });

      this.findLowStock();
      this.updateColumns();
  }

  private saveState() {
    const state: ProductsState = {
      filters: this.form.value,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.currentSortField,
      sortDirection: this.currentSortDirection,
      show: this.show
    };

    sessionStorage.setItem(PRODUCTS_STATE_KEY, JSON.stringify(state));
  }

  ngAfterViewInit() {
    // Chiamata iniziale
    this.getProducts();

    // Evento cambio pagina
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.saveState();
      this.getProducts();
    });

    this.sort.sortChange.subscribe(sort => {
      this.currentSortField = sort.active;
      this.currentSortDirection = sort.direction || 'desc';
      this.pageIndex = 0;
      this.paginator.firstPage();
      this.saveState();
      this.getProducts();
    });
  }

  showCloseFilter(){
    this.show = !this.show;
    this.saveState();
    this.updateColumns();
  }

  private updateColumns() {
    const supplierCols = ['category', 'supplier', 'supplierCode'];

    this.displayedColumns = this.ALL_COLUMNS.filter(col =>
      this.show || !supplierCols.includes(col)
    );
  }

  onSubmit(){
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.saveState();
    this.getProducts();
  }

  remove(){
    sessionStorage.removeItem('products_state');
    
    this.form.patchValue({
      categoryId: [],
      supplierId: [],
      name: []
    });

    this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }

    this.getProducts();
  }

  getProducts() 
  {
    const { categoryId, supplierId, name } = this.form.value;

    this.firstLoading = true;
    const params = new URLSearchParams();

    params.append('page', (this.pageIndex + 1).toString());
    params.append('limit', this.pageSize.toString());
    params.append('sortField', this.currentSortField);
    params.append('sortDirection', this.currentSortDirection);

    if (categoryId) params.append('categoryId', categoryId);
    if (supplierId) params.append('supplierId', supplierId);
    if (name) params.append('name', name);

    const query = `?${params.toString()}`;

    this.productService.getProducts(query)
    .pipe(
      tap(() => this.firstLoading = true),
      finalize(() => this.firstLoading = false)
    )
    .subscribe((response: any) => {
      const data = response.data || [];
      this.totalItems = response.total;
      this.pageSize = response.limit;
      this.pageIndex = response.page - 1;

      this.Products = data.map((p: any) => ({
        ...p,
        action: {
          duplicate: 'ri-file-copy-line',
          edit: 'ri-edit-line',
          movements: 'ri-search-line',
          delete: 'ri-delete-bin-line'
        }
      }));

      // 🔹 Aggiornamento datasource e sort
      this.dataSource = new MatTableDataSource<ProductViewModel>(this.Products);
      this.dataSource.sort = this.sort;

      this.paginator.pageIndex = this.pageIndex;
      this.paginator.length = this.totalItems;

      if (this.sort.active) {
        this.sort.active = this.currentSortField;
        this.sort.direction = this.currentSortDirection;
      }

      this.firstLoading = false;
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
              this.findLowStock();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  DuplicateItem(item: ProductViewModel) {
    const dialogRef = this.dialog.open(AddDuplicateProductComponent, {
      data: {id: item.id, name: item.name },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.firstLoading = true;
        console.log(result);

        const requests = [];

        for (let i = 0; i < result.number; i++) {
          const name = result[`duplicate_${i + 1}`];

          requests.push(
            this.productService.duplicateProduct(item!.id!, name)
          );
        }

        forkJoin(requests).subscribe(() => {
          this.getProducts();
          this.findLowStock();
          this.firstLoading = false;
        });
        
      } else {
        console.log("Close");
      }
    });
  }

  ShowMovements(item: ProductViewModel){
    const dialogRef = this.dialog.open(MovementsComponent, {
      data: item,
      width: '80vw',
      maxWidth: '1000px'
    });
  }

  UpdateItem(item: ProductViewModel) {
    this.router.navigate(["/product/add/" + item.id]);
  }

  getEnabledStatus(enabled: boolean): string {
    return enabled ? "Attivo" : "Disattivo";
  }


  AddGeneralMovement(){
    const dialogRef = this.dialog.open(AddGeneralMovementComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) 
      {
        if(result.movementType != MovementType[0].id)
        {
          result.supplierId = null,
          result.supplierName = null,
          result.supplierCode = null
        }

        this.productMovementsService.setProductMovements(result)
          .subscribe((data: ProductMovements) => {
            if (data) {
              this.getProducts();
              this.findLowStock();
              const title = result.movementType == MovementType[0].id ? 'Carico' : 'Scarico';

              const description =
                title +
                ` del prodotto ${result.productName} di ${data.stock} ${result.stock_type}`;

              this.toastr.info(description);
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  addMovements(item: ProductViewModel){
    const dialogRef = this.dialog.open(AddMovementComponent, {
      data: item,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      //console.log(result);
      if (result) {
       if(result.movementType == MovementType[0].id)
        {
          result.supplierId = item.supplier?._id,
          result.supplierName = item.supplier?.businessName,
          result.supplierCode = item.supplierCode
        }

        this.productMovementsService.setProductMovements(result)
          .subscribe((data: ProductMovements) => {
            if (data) {
              this.getProducts();
              this.findLowStock();

              const title = result.movementType == MovementType[0].id ? 'Carico' : 'Scarico';

              const description =
                title +
                ` del prodotto ${item.name} di ${data.stock} ${item.stock_type}`;

              this.toastr.info(description);
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  checkStockLevels(){
    const data = this.lowStock;
    const below = data.filter(e => e.stock! < e.theshold!).length;

    if (below > 0) 
    {
      this.showStock = true;

      let txt = "";

      if(below > 0)
        txt = `${below} prodotti sotto soglia`;

      this.text = `<h2>Attenzione</h2>${txt}`;

    }
    else
      this.showStock = false;
  }

  closeAlert(): void {
    this.showStock = false;
  }

showAlertMovement(description: string) {
    const id = ++this.alertId;
    this.alerts.push({ id, description });

    setTimeout(() => this.removeAlert(id), 3000);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter(a => a.id !== id);
  }

}
