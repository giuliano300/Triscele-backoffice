import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { PermissionHolidayService } from '../../services/PermissionHoliday.service';
import { MatDialog } from '@angular/material/dialog';
import { PermissionHoliday } from '../../interfaces/permissionHoliday';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FeatherModule } from 'angular-feather';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { NgFor, NgIf } from '@angular/common';
import { OperatorService } from '../../services/Operator.service';
import { Operators } from '../../interfaces/operators';
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-absence',
  imports: [
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormField,
    FeatherModule,
    MatLabel,
    MatSelect,
    MatOption,
    FormsModule,
    ReactiveFormsModule,
    FeathericonsModule,
    NgFor,
    MatTooltip,
    NgIf
],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.scss'
})
export class AbsenceComponent {

  permissionHoliday: PermissionHoliday[] = [];

  displayedColumns: string[] = ['operatorId', 'type', 'reason', 'startDate', 'endDate', 'accepted', 'edit', 'delete'];

  dataSource = new MatTableDataSource<PermissionHoliday>(this.permissionHoliday);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  

  constructor(
      private router: Router,
      private permissionHolidayService: PermissionHolidayService,
      private dialog: MatDialog,
      private fb: FormBuilder,
      private operatorService: OperatorService
  ) {
    
    this.form = this.fb.group({
      operatorId: []
    });

  }

  operators: Operators[] = [];

  ngOnInit(): void {
    this.getpPermissionHoliday();
    this.operatorService.getOperators().subscribe((d: Operators[]) => {
      this.operators = d;
    })
  }

  getpPermissionHoliday(operatorId?: string){
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

  UpdateItem(item: PermissionHoliday, approve: boolean){
    let title = "Vuoi approvare la richiesta?"
    let description = "Approvando la richiesta troverai l'assenza nel calendario operatore."
    let button = "Conferma";
    if(!approve){
      title = "Vuoi negare la richiesta?";
      description = "Negando la richiesta verrà annullata.";
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data:{title: title, description: description, confirm: button}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        item.accepted = approve;
        item.operatorId! = item.operatorId = ((item.operatorId as unknown) as Operators)?._id ?? '';
        console.log(JSON.stringify(item));
        this.permissionHolidayService.updatePermissionHoliday(item)
          .subscribe((data: boolean) => {
            if(data){
              this.getpPermissionHoliday();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
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
              this.getpPermissionHoliday();
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

  onSubmit(){
    const { operatorId } = this.form.value;
    this.getpPermissionHoliday(operatorId);
  }

  remove(){
    this.getpPermissionHoliday();
    this.form.patchValue({
      operatorId: []
    });
  }
}
