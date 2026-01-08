import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import localeIt from '@angular/common/locales/it';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { animate, style, transition, trigger } from '@angular/animations';
import { Illness } from '../interfaces/Illness';
import { FeathericonsModule } from '../icons/feathericons/feathericons.module';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { absenceType } from '../enum/enum';
import { PermissionHoliday } from '../interfaces/permissionHoliday';
import { PermissionHolidayService } from '../services/PermissionHoliday.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Operators } from '../interfaces/operators';
import { OperatorService } from '../services/Operator.service';

registerLocaleData(localeIt);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};
@Component({
  selector: 'app-add-update-permission-holoday',
  imports: [MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSelectModule,
    NgxFileDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule, 
    FeathericonsModule,
    NgxMatTimepickerModule
  ],
  templateUrl: './add-update-permission-holiday.component.html',
  styleUrl: './add-update-permission-holiday.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    provideNativeDateAdapter()
  ],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AddUpdatePermissionHolidayComponent {
  title: string = "Aggiungi richiesta di permesso o assenza";

  illness: Illness[] = [];

  type: any[] = [{id: 1, name: "Ferie"}, {id: 2, name: "Permesso"}, {id: 3, name: "Assenza ingiustificata"}]

  form: FormGroup;

  province: string[] = [];

  operators: Operators[] = [];

  dateStartName: string = "";
  dateEndName: string = "";

  isPermesso: boolean = false;
  isFerie: boolean = false;
  isAssenza: boolean = false;

  constructor(
      private router: Router,
      private permissionHolidayService: PermissionHolidayService,
      private operatorService: OperatorService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>,
      public dialogRef: MatDialogRef<AddUpdatePermissionHolidayComponent>,
      @Inject(MAT_DIALOG_DATA) public data:  PermissionHoliday
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.form = this.fb.group({
      operatorId: ['', Validators.required],
      type: ['', Validators.required],
      start: ['', Validators.required],
      accepted: [true, Validators.required],
      end: [''],
      startHour: [''],
      endHour: [''],
      reason: [''],
      id: [''],
    });
  }

  ngOnInit(): void {
    this.operatorService.getOperators().subscribe((d) =>{
      this.operators = d;

      //console.log(this.data);

      if (this.data._id) {
        this.title = "Modifica richiesta di permesso o assenza";

        this.form.patchValue({
          type: this.data.type,
          start: this.data.startDate,
          end: this.data.endDate,
          startHour: this.data.startHour,
          endHour: this.data.endHour,
          reason: this.data.reason,
          id: this.data._id,
          operatorId: (this.data.operatorId as any)._id,
          accepted: this.data.accepted
        });
        let event: any = {};
        event.value = this.data.type;
        this.setAbsenceType(event);
          
      }
    })
  };

  toDateOnly(date: Date): string {
    const year = new Date(date).getFullYear();
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const day = String(new Date(date).getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  returnBack(){
    this.dialogRef.close(false);
  }

  
  onSubmit() {
    if (this.form.valid) {
      const formData = {
        ...this.form.value,
        read: true,
        startDate: this.toDateOnly(this.form.value.start),
        endDate: this.form.value.end ? this.toDateOnly(this.form.value.end) : this.toDateOnly(this.form.value.start),
      };

      const w: PermissionHoliday = formData;
      if(w.type == absenceType.assenza_ingiustificata)
        w.accepted = true;

      if(this.data)
      {
        w._id = this.data._id;
        this.permissionHolidayService.updatePermissionHoliday(w)
        .subscribe((data: boolean) => {
          if(data){
            this.dialogRef.close(data);
          }
          else
            console.log("errore");
        })
      }
      else
      {
        this.permissionHolidayService.setPermissionHoliday(w)
        .subscribe((data: PermissionHoliday) => {
          if(data){
             this.dialogRef.close(data);
          }
          else
            console.log("errore");
        })
      }
    } 
    else 
    {
      console.warn('Form non valido');
    }
  }

  setAbsenceType(event: any){
    const type = event.value;

    // Prima resetto tutte le validazioni
    this.form.get('end')?.clearValidators();
    this.form.get('startHour')?.clearValidators();
    this.form.get('endHour')?.clearValidators();

    if(type == absenceType.ferie)
    {
      this.isFerie = true;
      this.isAssenza = false;
      this.isPermesso = false;
      this.dateStartName = "Data inizio ferie";
      this.dateEndName = "Data fine ferie";
      this.form.get('end')?.setValidators([Validators.required]);
    }

    if(type == absenceType.assenza_ingiustificata)
    {
      this.isFerie = false;
      this.isAssenza = true;
      this.isPermesso = false;
      this.dateStartName = "Data inizio assenza";
      this.dateEndName = "Data fine assenza";
      this.form.get('end')?.setValidators([Validators.required]);
    }

    if(type == absenceType.permesso)
    {
      this.isFerie = false;
      this.isAssenza = false;
      this.isPermesso = true;
      this.dateStartName = "Data permesso";
      // Ore inizio/fine obbligatorie
      this.form.get('startHour')?.setValidators([Validators.required]);
      this.form.get('endHour')?.setValidators([Validators.required]);
      this.form.get('reason')?.setValidators([Validators.required, Validators.minLength(10)]);
    }

    // Aggiorna lo stato delle validazioni
    this.form.get('end')?.updateValueAndValidity();
    this.form.get('startHour')?.updateValueAndValidity();
    this.form.get('endHour')?.updateValueAndValidity();
    this.form.get('reason')?.updateValueAndValidity();
  }
}
