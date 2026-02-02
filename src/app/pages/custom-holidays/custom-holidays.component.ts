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
import { AddUpdateAllowedIpDialogComponent } from '../../add-update-allowed-ip-dialog/add-update-allowed-ip-dialog.component';
import { Holiday } from '../../interfaces/holidays';
import { HolidayService } from '../../services/holiday.service';
import { AddUpdateHolidayDialogComponent } from '../../add-update-holiday-dialog/add-update-holiday-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-custom-holodays',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule, DatePipe],
  templateUrl: './custom-holidays.component.html',
  styleUrl: './custom-holidays.component.scss'
})
export class CustomHolidaysComponent {

  holidays: Holiday[] = [];

  displayedColumns: string[] = ['date', 'description', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Holiday>(this.holidays);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private holidayService: HolidayService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getHolidays();
   }

  getHolidays(){
    this.holidayService.getCustom()
    .subscribe((data: Holiday[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
        this.dataSource.data = [];
      } 
      else 
      {
        this.holidays = data.map(c => ({
            ...c,
            data: new Date(c.date),
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Holiday>(this.holidays);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:Holiday){
    const dialogRef = this.dialog.open(AddUpdateHolidayDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: Holiday) => {
      if (result) 
      {
        if(!item)
          this.holidayService.create(result)
            .subscribe((data: Holiday) => {
              if(data) 
                this.getHolidays();
          });
        else
        {
          result._id = item._id;
          this.holidayService.update(result)
            .subscribe((success: Holiday) => {
              if (success) 
                this.getHolidays();
          });   
        }
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  UpdateItem(item: Holiday){
    this.OpenPopUp(item);
  }

  DeleteItem(item: Holiday){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.holidayService.delete(item._id!)
          .subscribe((data: boolean) => {
            if(data){
              this.getHolidays();
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
