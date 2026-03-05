import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService } from '../services/Attendance.service';
import { Attendance, Break } from '../interfaces/attendance';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTooltip } from "@angular/material/tooltip";

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
    ReactiveFormsModule,
    MatTooltip
]
})
export class AddUpdateDeleteAttendanceDialogComponent {
  
  title: string = "";

  form: FormGroup;

  isUpdate: boolean = false;

  attendance: Attendance | undefined;

  addBreaks: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddUpdateDeleteAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  any,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private attendanceService: AttendanceService
  ) {
    this.form = this.fb.group({
      entryTime: ['', Validators.required],
      exitTime: [''],
      notes: [''],

      breakForm: this.fb.group({
        startTime: [''],
        endTime: ['']
      })
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
        this.attendance = data;
        this.form.patchValue({
          entryTime: data.entryTime,
          exitTime: data.exitTime,
          notes: data.notes
        });
      })
    }
  }

  closeBreak(){
    this.addBreaks = false;
  }

  addBreak(){
    this.addBreaks = true;
  }

  deleteBreak(b: any){
    this.attendanceService
      .removeBreak(this.attendance!._id!, b)
      .subscribe((updated: Attendance) => {

        this.attendance = updated;

      });
  }

  saveBreak() {
    const breakData = this.form.get('breakForm')?.value;

    if (!breakData.startTime || !breakData.endTime)
      return;

    console.log(breakData);

    // qui puoi salvarla o pusharla nella lista
    this.addBreaks = false;

    this.form.get('breakForm')?.reset();

    const breakItem: Break = {
      start:breakData.startTime,
      end:breakData.endTime
    } 

    this.attendanceService.addBreak(this.attendance!._id!, breakItem)
      .subscribe((updated: Attendance) => {

       this.attendance = updated;

       this.addBreaks = false;
       this.form.get('breakForm')?.reset();
    });      
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
