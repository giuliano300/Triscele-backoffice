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
import { Categories } from '../../../interfaces/categories';
import { CategoryService } from '../../../services/Category.service';
import { AddUpdateCategoryDialogComponent } from '../../../add-update-category-dialog/add-update-category-dialog.component';

@Component({
  selector: 'app-categories',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {

  categories: Categories[] = [];

  displayedColumns: string[] = ['name', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Categories>(this.categories);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private categoriesService: CategoryService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getCategories();
   }

  getCategories(){
    this.categoriesService.getCategories()
    .subscribe((data: Categories[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.categories = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Categories>(this.categories);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:Categories){
    const dialogRef = this.dialog.open(AddUpdateCategoryDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: Categories) => {
      if (result) 
      {
        if(!item)
          this.categoriesService.setCategory(result)
            .subscribe((data: Categories) => {
              if(data) 
                this.getCategories();
          });
        else
          this.categoriesService.updateCategory(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getCategories();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item:Categories){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.categoriesService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getCategories();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Categories){
    this.OpenPopUp(item);
  }

}
