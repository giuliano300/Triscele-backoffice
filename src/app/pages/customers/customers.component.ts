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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { UtilsService } from '../../services/utils.service';
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-customers',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatPaginatorModule, 
    MatTableModule, 
    MatCheckboxModule, 
    FeathericonsModule, 
    MatFormField, 
    MatLabel,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelect,
    MatSelectModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {

  customers: Customers[] = [];

  province: string[] = [];

  displayedColumns: string[] = ['businessName', 'vatNumber', 'email', 'pwd', 'mobile', 'province', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Customers>(this.customers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  form!: FormGroup;
  
  constructor(
      private fb: FormBuilder,
      private router: Router,
      private customerService: CustomerService,
      private dialog: MatDialog,
      private utilsService: UtilsService
  ) {}

   ngOnInit(): void {
     this.form = this.fb.group({
      name: [],
      province: []
     });
      this.getCustomers();
     this.province = this.utilsService.getProvinceItaliane();
  }

  getCustomers(name?: string, province?: string){
    let query = '';

    if (name || province) {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (province) params.append('province', province);
      query = `?${params.toString()}`;
    }
    this.customerService.getCustomers(query)
    .subscribe((data: Customers[]) => {
      if (!data || data.length === 0) {
       this.dataSource.data = [];
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

  onSubmit(){
    const { name, province } = this.form.value;
    this.getCustomers(name, province);

  }

  remove(){
    this.form.patchValue({
      name: [],
      province: []
    });
    this.getCustomers();
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
