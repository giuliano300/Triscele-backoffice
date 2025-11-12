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
    FeathericonsModule],
  templateUrl: './add-illness.component.html',
  styleUrl: './add-illness.component.scss',
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
export class AddIllnessComponent {
  title: string = "Aggiungi comunicazione malattia";

  illness: Illness[] = [];

  disciplinaryForm: FormGroup;

  province: string[] = [];

  id: string | null = null;

  operatorId: string | undefined = undefined;

  constructor(
      private router: Router,
      private illnessService: IllnessService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.disciplinaryForm = this.fb.group({
      protocol: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
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

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Modifica comunicazione malattia";

        this.illnessService.getIllness(this.id)
          .subscribe((data: Illness) => {
            this.disciplinaryForm.patchValue({
              protocol: data.protocol,
              start: data.start,
              end: data.end,
              id: this.id
            });
          });
      }
    });

  }

  toDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // "2025-11-29"
  }
  
  returnBack(){
    if(localStorage.getItem("back-calendar"))
      this.router.navigate(["/operator/calendar"]);
    else
      this.router.navigate(["/operator/illness"]);
  }

  
  onSubmit() {
    if (this.disciplinaryForm.valid) {
      const formData = {
        ...this.disciplinaryForm.value,
        operatorId: this.operatorId,
        read: false,
        start: this.toDateOnly(this.disciplinaryForm.value.start),
        end: this.toDateOnly(this.disciplinaryForm.value.end)
      };

      const w: Illness = formData;

      if(this.id)
      {
        w._id = this.id;
        this.illnessService.updateIllness(w)
        .subscribe((data: boolean) => {
          if(data)
          {
             if(localStorage.getItem("back-calendar"))
              this.router.navigate(["/operator/calendar"]);
            else
              this.router.navigate(["/operator/illness"]);
          }
          else
            console.log("errore");
        })
      }
      else
      {
        this.illnessService.setIllness(w)
        .subscribe((data: Illness) => {
          if(data)
          {
             if(localStorage.getItem("back-calendar"))
              this.router.navigate(["/operator/calendar"]);
            else
              this.router.navigate(["/operator/illness"]);
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
}
