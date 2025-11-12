import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Illness } from '../../../interfaces/Illness';
import { IllnessService } from '../../../services/Illness.service';

@Component({
  selector: 'app-illness',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './illness.component.html',
  styleUrl: './illness.component.scss'
})
export class IllnessComponent {

  illness: Illness[] = [];

  displayedColumns: string[] = ['protocol', 'startDate', 'endDate', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Illness>(this.illness);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
      private router: Router,
      private illnessService: IllnessService,
      private dialog: MatDialog
  ) {}

  operatorId: string | undefined = undefined;

  ngOnInit(): void {
    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      this.operatorId = o.sub;  
    }
    this.getpIllness(this.operatorId!);

    localStorage.removeItem("back-calendar");

  }

  getpIllness(operatorId: string){
    this.illnessService.getIllnesss(operatorId).subscribe((data) => {
      this.dataSource.data =  data.map(c => ({
          ...c, 
          action: {
              edit: 'ri-edit-line',
              delete: 'ri-delete-bin-line'
          }
        }));
    })
  }

  UpdateItem(item: Illness){
    this.router.navigate(["operator/illness/add/" + item._id]);
  }

  DeleteItem(item: Illness){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.illnessService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getpIllness(this.operatorId!);
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

}
