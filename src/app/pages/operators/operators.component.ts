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

@Component({
  selector: 'app-operators',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.scss'
})
export class OperatorsComponent {

  Operators: Operators[] = [];

  displayedColumns: string[] = ['businessName', 'fiscalCode', 'email', 'mobile', 'status', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Operators>(this.Operators);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private operatorService: OperatorService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getOperators();
   }

  getOperators(){
    this.operatorService.getOperators()
    .subscribe((data: Operators[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.Operators = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Operators>(this.Operators);
        this.dataSource.paginator = this.paginator;
      }
    });
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
