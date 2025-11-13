import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Illness } from '../../interfaces/Illness';
import { IllnessService } from '../../services/Illness.service';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FeatherModule } from "angular-feather";
import { MatSelect, MatOption } from "@angular/material/select";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { OperatorService } from '../../services/Operator.service';
import { Operators } from '../../interfaces/operators';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-operator-illness',
  imports: [
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
    NgFor
  ],
  templateUrl: './operator-illness.component.html',
  styleUrl: './operator-illness.component.scss'
})
export class OperatorIllnessComponent {

  illness: Illness[] = [];

  displayedColumns: string[] = ['operatorId','protocol', 'startDate', 'endDate', 'delete'];

  dataSource = new MatTableDataSource<Illness>(this.illness);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  
  constructor(
      private router: Router,
      private illnessService: IllnessService,
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
    this.getIllness();
    this.operatorService.getOperators().subscribe((d:Operators[]) => {
      this.operators = d;
    })
  }

  getIllness(operatorId?: string){
    this.illnessService.getIllnesss(operatorId).subscribe((data) => {
      this.dataSource.data =  data.map(c => ({
          ...c, 
          action: {
              delete: 'ri-delete-bin-line'
          }
        }));
    })
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
              this.getIllness();
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


  onSubmit(){
    const { operatorId } = this.form.value;
    this.getIllness(operatorId);
  }

  remove(){
    this.getIllness();
    this.form.patchValue({
      operatorId: []
    });
  }
}
