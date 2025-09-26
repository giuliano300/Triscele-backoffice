import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Product } from '../../interfaces/products';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ProductService } from '../../services/Product.service';

@Component({
  selector: 'app-products',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  Products: Product[] = [];

  displayedColumns: string[] = [
    'name',
    'internalCode',
    'price',
    'cost',
    'enabled',
    'supplierCode',
    'edit',
    'delete'
  ];

  dataSource = new MatTableDataSource<Product>(this.Products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProducts()
      .subscribe((data: Product[]) => {
        if (!data || data.length === 0) {
          console.log('Nessun prodotto disponibile');
        } else {
          this.Products = data.map(p => ({
            ...p,
            action: {
              edit: 'ri-edit-line',
              delete: 'ri-delete-bin-line'
            }
          }));
          this.dataSource = new MatTableDataSource<Product>(this.Products);
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  DeleteItem(item: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.productService.delete(item._id!)
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

  UpdateItem(item: Product) {
    this.router.navigate(["/product/add/" + item._id]);
  }

  getEnabledStatus(enabled: boolean): string {
    return enabled ? "Attivo" : "Disattivo";
  }
}
