import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/Customer.service';
import { MatDialog } from '@angular/material/dialog';
import { Customers } from '../../interfaces/customers';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customers',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {

  customers: Customers[] = [];

  displayedColumns: string[] = ['businessName', 'vatNumber', 'email', 'mobile', 'status', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Customers>(this.customers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private customerService: CustomerService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getCustomers();
   }

  getCustomers(){
    this.customerService.getCustomers()
    .subscribe((data: Customers[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.customers = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Customers>(this.customers);
        this.dataSource.paginator = this.paginator;
      }
    });
  }


      DeleteItem(item:Customers){

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px'
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.customerService.delete(item._id)
            .subscribe((data: boolean) => {
              if(data){
                this.getCustomers();
              }
            });
        } 
        else 
        {
          console.log("Close");
        }
      });
    }

    UpdateItem(item: Customers){
      this.router.navigate(["/customer/add/" + item._id]);
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
