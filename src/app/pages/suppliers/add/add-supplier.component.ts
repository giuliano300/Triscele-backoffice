import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
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
import { Supplier } from '../../../interfaces/suppliers';
import { SupplierService } from '../../../services/Supplier.service';
import { UtilsService } from '../../../services/utils.service';
import { partitaIvaValidator } from '../../../validators/vat.validator';

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
    FeathericonsModule, 
    MatSelectModule, 
    NgxFileDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule
  ],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.scss',
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
export class AddSupplierComponent {
  title: string = "Aggiungi fornitore";

  suppliers: Supplier[] = [];

  disciplinaryForm: FormGroup;

  province: string[] = [];

  id: string | null = null;

  constructor(
      private router: Router,
      private supplierService: SupplierService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>,
      private utilsService: UtilsService
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.disciplinaryForm = this.fb.group({
      businessName: ['', Validators.required],
      vatNumber: ['', [Validators.required, partitaIvaValidator]],
      mobile: [''],
      sdi: [''],
      email: ['', Validators.required],
      address: [''],
      zipCode: [''],
      province: ['', Validators.required],
      city: [''],
      id: [''],
    });

    this.province = utilsService.getProvinceItaliane();
  }


  selectedWorkerId: number | null = null;

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Aggiorna fornitore";

        this.supplierService.getSupplier(this.id)
          .subscribe((data: Supplier) => {
            this.disciplinaryForm.patchValue({
              businessName: data.businessName,
              mobile: data.mobile,
              sdi: data.sdi,
              email: data.email,
              vatNumber: data.vatNumber,
              address: data.address,
              zipCode: data.zipCode,
              province: data.province,
              city: data.city,
              id: this.id
            });
          });
      }
    });

  }

  returnBack(){
    this.router.navigate(["/suppliers"]);
  }

  
  onSubmit() {
    if (this.disciplinaryForm.valid) {
      const formData = {
        ...this.disciplinaryForm.value,
        status: Number(this.disciplinaryForm.value.status),      
      };

      const w: Supplier = formData;
      w.status = 1;

      if(this.id)
      {
        w._id = this.id;
        this.supplierService.updateSupplier(w)
        .subscribe((data: boolean) => {
          if(data)
            this.router.navigate(["/suppliers"]);
          else
            console.log("errore");
        })
      }
      else
      {
        this.supplierService.setSupplier(w)
        .subscribe((data: Supplier) => {
          if(data)
            this.router.navigate(["/suppliers"]);
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
