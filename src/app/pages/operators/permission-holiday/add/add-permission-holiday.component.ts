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
import { Component, LOCALE_ID } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { animate, style, transition, trigger } from '@angular/animations';
import { IllnessService } from '../../../../services/Illness.service';
import { Illness } from '../../../../interfaces/Illness';
import { FeathericonsModule } from '../../../../icons/feathericons/feathericons.module';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { absenceType } from '../../../../enum/enum';
import { PermissionHoliday } from '../../../../interfaces/permissionHoliday';
import { PermissionHolidayService } from '../../../../services/PermissionHoliday.service';

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
  selector: 'app-add-supplier',
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
  templateUrl: './add-permission-holiday.component.html',
  styleUrl: './add-permission-holiday.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AddPermissionHolidayComponent {
  title: string = "Aggiungi richiesta di permesso o assenza";

  illness: Illness[] = [];

  type: any[] = [{id: 1, name: "Ferie"}, {id: 2, name: "Permesso"}]

  form: FormGroup;

  province: string[] = [];

  dateStartName: string = "";

  id: string | null = null;

  operatorId: string | undefined = undefined;

  isPermesso: boolean = false;
  isFerie: boolean = false;

  constructor(
      private router: Router,
      private permissionHolidayService: PermissionHolidayService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.form = this.fb.group({
      type: ['', Validators.required],
      start: ['', Validators.required],
      end: [''],
      startHour: [''],
      endHour: [''],
      reason: [''],
      id: [''],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      this.operatorId = o.sub;  
    }

    this.route.paramMap.subscribe(params => 
    {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Modifica richiesta di permesso o assenza";

        this.permissionHolidayService.getPermissionHoliday(this.id)
          .subscribe((data: PermissionHoliday) => {
            this.form.patchValue({
              type: data.type,
              start: data.startDate,
              end: data.endDate,
              startHour: data.startHour,
              endHour: data.endHour,
              reason: data.reason,
              id: this.id
            });
            let event: any = {};
            event.value = data.type;
            this.setAbsenceType(event);
          
          });
      }
    });

  }

  toDateOnly(date: Date): string {
    const year = new Date(date).getFullYear();
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const day = String(new Date(date).getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  returnBack(){
    if(localStorage.getItem("back-calendar"))
      this.router.navigate(["/operator/calendar"]);
    else
      this.router.navigate(["/operator/permission-holiday"]);
  }

  
  onSubmit() {
    if (this.form.valid) {
      const formData = {
        ...this.form.value,
        operatorId: this.operatorId,
        read: false,
        startDate: this.toDateOnly(this.form.value.start),
        endDate: this.form.value.end ? this.toDateOnly(this.form.value.end) : this.toDateOnly(this.form.value.start),
        accepted: null
      };

      const w: PermissionHoliday = formData;

      if(this.id)
      {
        w._id = this.id;
        this.permissionHolidayService.updatePermissionHoliday(w)
        .subscribe((data: boolean) => {
          if(data){
            if(localStorage.getItem("back-calendar"))
              this.router.navigate(["/operator/calendar"]);
            else
              this.router.navigate(["/operator/permission-holiday"]);

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
            if(localStorage.getItem("back-calendar"))
              this.router.navigate(["/operator/calendar"]);
            else
              this.router.navigate(["/operator/permission-holiday"]);

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
      this.isPermesso = false;
      this.dateStartName = "Data inizio ferie";
      this.form.get('end')?.setValidators([Validators.required]);
    }

    if(type == absenceType.permesso)
    {
      this.isFerie = false;
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
