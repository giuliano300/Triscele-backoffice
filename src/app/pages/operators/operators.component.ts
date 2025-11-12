import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OperatorService } from '../../services/Operator.service';
import { MatDialog } from '@angular/material/dialog';
import { Operators } from '../../interfaces/operators';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';
import { Permission } from '../../interfaces/permissions';
import { CommonModule } from '@angular/common';
import { Login } from '../../interfaces/Login';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { Sectors } from '../../interfaces/sectors';
import { SectorService } from '../../services/Sector.service';

@Component({
  selector: 'app-operators',
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
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.scss'
})
export class OperatorsComponent {

  Operators: Operators[] = [];

  displayedColumns: string[] = ['sectorId', 'name', 'lastName', 'email', 'status', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Operators>(this.Operators);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isAdmin:boolean = true;

  form!: FormGroup;

  sectors: any[] = [];
  
  constructor(
      private fb: FormBuilder,
      private router: Router,
      private operatorService: OperatorService,
      private dialog: MatDialog,
      private authService: AuthService,
      private sectorService: SectorService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sectorId: []
    });

    this.getOperators();
    const o = localStorage.getItem("operator");
    if(o)
      this.isAdmin = false;
    else
    {
      const i = this.displayedColumns.length - 1;
      this.displayedColumns.splice(i, 0, 'login');
    }

    this.sectorService.getSectors()
        .subscribe((data: Sectors[]) => {
          this.sectors = data;
    })
  }

  getOperators(sectorId?: string){
    this.operatorService.getOperators(sectorId)
    .subscribe((data: Operators[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
        this.dataSource.data = [];
      } 
      else 
      {
        this.Operators = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                login: 'ri-corner-down-right-fill',
                delete: 'ri-delete-bin-line'
            }
        }));
        this.dataSource = new MatTableDataSource<Operators>(this.Operators);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  onSubmit(){
    const sectorId = this.form.value.sectorId;
    this.getOperators(sectorId);
  }

  remove(){
    this.form.patchValue({
      sectorId: []
    });
    this.getOperators('');
  }

  DeleteItem(item:Operators){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.operatorService.delete(item._id!)
          .subscribe((data: boolean) => {
            if(data){
              this.getOperators();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Operators){
    this.router.navigate(["/operator/add/" + item._id]);
  }

  LoginAs(item: Operators){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data:{title:"Login operatore", description: 'Sei sicuro di voler accedere come ' + item.businessName + '?', confirm: "Conferma"},
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        let login: Login = {
          email: item.email,
          password: item.pwd
        };
        
        this.operatorService.loginOperator(login).subscribe((data: any) => {
          if(data != null)
          {
            const o = this.authService.decodeToken(data)!
            const login = this.operatorService.setOperatorAfterLogin(o, data);
            
            this.authService.setIsAdminState(false, true, o!.name!);

            if(login)
            {
              const l = JSON.parse(localStorage.getItem("permissions") || "[]");
                  if(!l)
                  {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('isLogin');
                    localStorage.removeItem('isAdmin');
                    localStorage.removeItem('isOperator');
                    this.authService.clearRoles();
                    this.router.navigate(['/']);
                  }
              
                  const p: Permission = l[0];
                  switch(p.permissionName.toUpperCase()){
                    case 'CUSTOMERSMODULE':
                      this.router.navigate(['/customers']);
                      break;
                    case 'PRODUCTSMODULE':
                      this.router.navigate(['/products']);
                      break;
                    case 'ORDERSMODULE':
                      this.router.navigate(['/operator-orders']);
                      break;
                    case 'OPERATORSMODULE':
                      this.router.navigate(['/operators']);
                      break;
                    case 'SUPPLIERSMODULE':
                      this.router.navigate(['/suppliers']);
                      break;
                    default:
                      this.router.navigate(['/dashboard']);
                      break;
                  }
            }
          }
        })
      } 
      else 
      {
        console.log("Close");
      }
    });

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
