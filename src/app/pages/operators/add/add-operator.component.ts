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
import { Operators } from '../../../interfaces/operators';
import { OperatorService } from '../../../services/Operator.service';
import { UtilsService } from '../../../services/utils.service';
import { MatStepperModule } from '@angular/material/stepper';
import { codiceFiscaleValidator } from '../../../validators/fiscalCode.validator';
import { Permission } from '../../../interfaces/permissions';
import { PermissionService } from '../../../services/Permission.service';
import { MatCheckbox } from "@angular/material/checkbox";

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
  selector: 'app-add-Operator',
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
    CommonModule,
    MatStepperModule, MatCheckbox],
  templateUrl: './add-operator.component.html',
  styleUrl: './add-operator.component.scss',
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
export class AddOperatorComponent {
  title: string = "Aggiungi operatore";

  Operators: Operators[] = [];

  disciplinaryForm: FormGroup;

  province: string[] = [];

  id: string | null = null;

  permissions: Permission[] = [];

  constructor(
      private router: Router,
      private OperatorService: OperatorService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>,
      private utilsService: UtilsService,
      private permissionService: PermissionService
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.disciplinaryForm = this.fb.group({
        personalData: this.fb.group({
          businessName: ['', Validators.required],
          fiscalCode: ['', [Validators.required, codiceFiscaleValidator]],
          name: [''],
          lastName: [''],
          birthDate: [''],
          mobile: [''],
          status: [null, Validators.required]
        }),
        accessData: this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          pwd: ['', Validators.required]
        }),
        addressData: this.fb.group({
          address: [''],
          zipCode: [''],
          province: ['', Validators.required],
          city: ['']
        }),
        permissionsData: this.fb.group({
          permissions: [[]] // opzionale
        }),
        id: ['']
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
        this.title = "Aggiorna operatore";

      this.OperatorService.getOperator(this.id)
        .subscribe((data: Operators) => {
          // patch dei dati principali
          this.disciplinaryForm.patchValue({
            personalData: {
              businessName: data.businessName,
              name: data.name,
              lastName: data.lastName,
              birthDate: data.birthDate,
              mobile: data.mobile,
              status: Number(data.status),
              fiscalCode: data.fiscalCode
            },
            accessData: {
              email: data.email,
              pwd: data.pwd
            },
            addressData: {
              address: data.address,
              zipCode: data.zipCode,
              province: data.province,
              city: data.city
            },
            permissionsData: {
              permissions: data.permissions ? data.permissions : []
            },
            id: this.id
          });
        });
      }

      this.permissionService.getPermissions()
          .subscribe((data:Permission[]) => {
            this.permissions = data;
          })
    });

  }

  returnBack(){
    this.router.navigate(["/operators"]);
  }

  isPermissionChecked(p: any): boolean {
    const permissions = this.disciplinaryForm.get('permissionsData.permissions')?.value || [];
    return permissions.some((perm: any) => perm._id === p._id);
  }

  onSubmit() {
    if (this.disciplinaryForm.valid) {
      const formData = {
        ...this.disciplinaryForm.value,
        status: Number(this.disciplinaryForm.value.personalData.status),      
      };

      let w: Operators = {
        _id: this.id ?? undefined,
        businessName: formData.personalData.businessName,
        name: formData.personalData.name,
        lastName: formData.personalData.lastName,
        birthDate: formData.personalData.birthDate,
        mobile: formData.personalData.mobile,
        status: formData.status,
        email: formData.accessData.email,
        pwd: formData.accessData.pwd,
        fiscalCode: formData.personalData.fiscalCode,
        permissions: formData.permissionsData.permissions,
        zipCode: formData.addressData.zipCode,
        province: formData.addressData.province,
        city: formData.addressData.city,
        address: formData.addressData.address,

      };

      if(this.id)
      {
        this.OperatorService.updateOperator(w)
        .subscribe((data: boolean) => {
          if(data)
            this.router.navigate(["/operators"]);
          else
            console.log("errore");
        })
      }
      else
      {
        this.OperatorService.setOperator(w)
        .subscribe((data: Operators) => {
          if(data)
            this.router.navigate(["/operators"]);
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

  togglePermission(p: any) {
    const checked = this.isPermissionChecked(p);
    this.onPermissionChange({ checked: !checked }, p);
  }

  onPermissionChange(event: any, permission: any) {
    const control = this.disciplinaryForm.get('permissionsData.permissions');
    let current = control?.value || [];

    if (event.checked) {
      // aggiungi oggetto intero se non già presente
      if (!current.some((perm: any) => perm._id === permission._id)) {
        current = [...current, permission];
      }
    } else {
      // rimuovi oggetto con stesso _id
      current = current.filter((perm: any) => perm._id !== permission._id);
    }

    control?.setValue(current);
    control?.markAsDirty();
  }

}
