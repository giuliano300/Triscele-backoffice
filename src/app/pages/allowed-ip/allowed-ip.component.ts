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
import { AllowedIp } from '../../interfaces/allowed-ip';
import { AllowedIpService } from '../../services/allowed-ip.service';
import { AddUpdateAllowedIpDialogComponent } from '../../add-update-allowed-ip-dialog/add-update-allowed-ip-dialog.component';

@Component({
  selector: 'app-allowed-ip',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './allowed-ip.component.html',
  styleUrl: './allowed-ip.component.scss'
})
export class AllowedIpComponent {

  allowedIp: AllowedIp[] = [];

  displayedColumns: string[] = ['ip', 'delete'];

  dataSource = new MatTableDataSource<AllowedIp>(this.allowedIp);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private allowedIpService: AllowedIpService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getAlloweIp();
   }

  getAlloweIp(){
    this.allowedIpService.getAll()
    .subscribe((data: AllowedIp[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
        this.dataSource.data = [];
      } 
      else 
      {
        this.allowedIp = data.map(c => ({
            ...c, 
            action: {
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<AllowedIp>(this.allowedIp);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:AllowedIp){
    const dialogRef = this.dialog.open(AddUpdateAllowedIpDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: AllowedIp) => {
      if (result) 
      {
        if(!item)
          this.allowedIpService.create(result)
            .subscribe((data: AllowedIp) => {
              if(data) 
                this.getAlloweIp();
          });
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item: AllowedIp){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.allowedIpService.delete(item._id!)
          .subscribe((data: boolean) => {
            if(data){
              this.getAlloweIp();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

}
