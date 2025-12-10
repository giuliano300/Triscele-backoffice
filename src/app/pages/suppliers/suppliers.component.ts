import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/Supplier.service';
import { MatDialog } from '@angular/material/dialog';
import { Supplier } from '../../interfaces/suppliers';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-suppliers',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent {

  Suppliers: Supplier[] = [];

  displayedColumns: string[] = ['businessName', 'vatNumber', 'email', 'mobile', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Supplier>(this.Suppliers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private supplierService: SupplierService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getSuppliers();
   }

  getSuppliers(){
    this.supplierService.getSuppliers()
    .subscribe((data: Supplier[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
        this.dataSource.data = [];
      } 
      else 
      {
        this.Suppliers = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Supplier>(this.Suppliers);
        this.dataSource.paginator = this.paginator;
      }
    });
  }


      DeleteItem(item:Supplier){

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px'
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.supplierService.delete(item._id)
            .subscribe((data: boolean) => {
              if(data){
                this.getSuppliers();
              }
            });
        } 
        else 
        {
          console.log("Close");
        }
      });
    }

    UpdateItem(item: Supplier){
      this.router.navigate(["/supplier/add/" + item._id]);
    }

    getElementStatus(status: string): string{
      switch(parseInt(status)){
        case 1:
          return "Attivo";
        case 2:
          return "Disattivo";
        case 3:
          return "Cancellato";
        default:
          return "";
      }
    }

}
