import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ProductsOptions } from '../../../interfaces/productsOptions';
import { CategoryService } from '../../../services/Category.service';
import { AddUpdateCategoryDialogComponent } from '../../../add-update-category-dialog/add-update-category-dialog.component';
import { ProductsOptionsService } from '../../../services/Products-Options.service';
import { AddUpdateProductsOptionsDialogComponent } from '../../../add-update-products-options-dialog/add-update-products-options-dialog.component';

@Component({
  selector: 'app-options',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './products-options.component.html',
  styleUrl: './products-options.component.scss'
})
export class ProductsOptionsComponent {

  productsOptions: ProductsOptions[] = [];

  displayedColumns: string[] = ['name', 'edit', 'delete'];

  dataSource = new MatTableDataSource<ProductsOptions>(this.productsOptions);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private productsOptionsService: ProductsOptionsService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getproductsOptions();
   }

  getproductsOptions(){
    this.productsOptionsService.getProductsOptions()
    .subscribe((data: ProductsOptions[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.productsOptions = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<ProductsOptions>(this.productsOptions);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:ProductsOptions){
    const dialogRef = this.dialog.open(AddUpdateProductsOptionsDialogComponent, {
      data: item,
      width: '80vw',
      maxWidth: '1000px'
    });
    dialogRef.afterClosed().subscribe((result: ProductsOptions) => {
      if (result) 
      {
        if(!item)
          this.productsOptionsService.setProductsOptions(result)
            .subscribe((data: ProductsOptions) => {
              if(data) 
                this.getproductsOptions();
          });
        else
          this.productsOptionsService.updateProductsOptions(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getproductsOptions();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item:ProductsOptions){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.productsOptionsService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getproductsOptions();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: ProductsOptions){
    this.OpenPopUp(item);
  }

}
