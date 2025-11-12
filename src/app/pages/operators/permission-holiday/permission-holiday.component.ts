import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { PermissionHolidayService } from '../../../services/PermissionHoliday.service';
import { MatDialog } from '@angular/material/dialog';
import { PermissionHoliday } from '../../../interfaces/permissionHoliday';

@Component({
  selector: 'app-permission-holiday',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './permission-holiday.component.html',
  styleUrl: './permission-holiday.component.scss'
})
export class PermissionHolidayComponent {

  permissionHoliday: PermissionHoliday[] = [];

  displayedColumns: string[] = ['type', 'reason', 'startDate', 'endDate', 'accepted', 'edit', 'delete'];

  dataSource = new MatTableDataSource<PermissionHoliday>(this.permissionHoliday);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
      private router: Router,
      private permissionHolidayService: PermissionHolidayService,
      private dialog: MatDialog
  ) {}

  operatorId: string | undefined = undefined;

  ngOnInit(): void {
    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      this.operatorId = o.sub;  
    }
    this.getpPermissionHoliday(this.operatorId!);
    
    localStorage.removeItem("back-calendar");

  }

  getpPermissionHoliday(operatorId: string){
    this.permissionHolidayService.getPermissionHolidays(operatorId).subscribe((data) => {
      this.dataSource.data =  data.map(c => ({
          ...c, 
          action: {
              edit: 'ri-edit-line',
              delete: 'ri-delete-bin-line'
          }
        }));
    })
  }

  UpdateItem(item: PermissionHoliday){
    this.router.navigate(["operator/permission-holiday/add/" + item._id]);
  }

  DeleteItem(item: PermissionHoliday){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.permissionHolidayService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getpPermissionHoliday(this.operatorId!);
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  getItalianDate(d:Date){
    return new Date(d).toLocaleDateString('it-IT');
  }

  getType(p: PermissionHoliday): string {
    let title = p.type === 1 ? 'Ferie' : 'Permesso';

    if (p.type !== 1 && p.startHour && p.endHour && p.startDate && p.endDate) {
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);

      // Usa la data in formato YYYY-MM-DD
      const startIso = startDate.toISOString().split('T')[0];
      const endIso = endDate.toISOString().split('T')[0];

      const start = new Date(`${startIso}T${p.startHour}`);
      const end = new Date(`${endIso}T${p.endHour}`);

      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      title += ` (${diffHours.toFixed(2)}h)`;
    }

    return title;
  }

  getAcceptedStatus(e: PermissionHoliday) {
    if (e.accepted === true) {
      return { text: 'Accettata', color: 'green' };
    }

    if (e.accepted === false) {
      return { text: 'Rifiutata', color: 'red' };
    }

    return { text: 'In attesa', color: 'orange' };
  }

}
