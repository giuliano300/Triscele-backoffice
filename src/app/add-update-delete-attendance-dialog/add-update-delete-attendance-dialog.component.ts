import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Categories } from '../interfaces/categories';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService } from '../services/Attendance.service';
import { Attendance } from '../interfaces/attendance';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-update-delete-attendance-dialog-dialog',
  templateUrl: './add-update-delete-attendance-dialog.component.html',
  styleUrls: ['./add-update-delete-attendance-dialog.component.scss'],
  standalone:true,
  imports: [
    MatDialogModule, 
    MatCardContent, 
    MatCard, 
    MatFormField, 
    MatFormFieldModule,
    FeathericonsModule, 
    MatInputModule,
    MatIconModule,
    MatLabel, 
    CommonModule,
   ReactiveFormsModule]
})
export class AddUpdateDeleteAttendanceDialogComponent {
  
  title: string = "";

  form: FormGroup;

  isUpdate: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddUpdateDeleteAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  any,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private attendanceService: AttendanceService
  ) {
    this.form = this.fb.group({
      entryTime: ['', Validators.required],
      exitTime: [''],
      notes: ['']
    });
  }

  

  ngOnInit(): void {
    //console.log(this.data);
    if(!this.data)
      this.onClose();

    this.title = "Aggiungi presenza il giorno " + new Date(this.data.date).toLocaleDateString("it-IT");
    if(this.data.id)
    {
      this.isUpdate = true;
      this.title = "Modifica o Elimina presenza del giorno " + new Date(this.data.date).toLocaleDateString("it-IT");
    }

    if(this.data.id){
      this.attendanceService.getAttendance(this.data.id).subscribe((data: Attendance) => {
        this.form.patchValue({
          entryTime: data.entryTime,
          exitTime: data.exitTime,
          notes: data.notes
        });
      })
    }
  }

  onSave() {
    if (this.form.valid) {
      const result: Attendance = {
        ...this.data!,
        ...this.form.value
      };
      this.dialogRef.close(result);
    }
  }

  onDelete(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px'
      });
  
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.dialogRef.close("delete");   
        } 
        else 
        {
          console.log("Close");
        }
      });
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
