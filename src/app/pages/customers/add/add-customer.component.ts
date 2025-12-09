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
import { Customers } from '../../../interfaces/customers';
import { CustomerService } from '../../../services/Customer.service';
import { UtilsService } from '../../../services/utils.service';
import { partitaIvaValidator } from '../../../validators/vat.validator';
import { AgentService } from '../../../services/Agent.service';
import { Agents } from '../../../interfaces/agents';

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
  selector: 'app-add-customer',
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
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss',
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
export class AddCustomerComponent {
  title: string = "Aggiungi Cliente";

  customers: Customers[] = [];
  agents: Agents[] = [];

  disciplinaryForm: FormGroup;

  province: string[] = [];

  id: string | null = null;

  constructor(
      private router: Router,
      private customerService: CustomerService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private adapter: DateAdapter<any>,
      private utilsService: UtilsService,
      private agentService: AgentService
  ) 
  {
    this.adapter.setLocale('it-IT');
    this.disciplinaryForm = this.fb.group({
      businessName: ['', Validators.required],
      vatNumber: ['', [Validators.required, partitaIvaValidator]],
      name: [''],
      lastName: [''],
      mobile: [''],
      sdi: [''],
      email: ['', Validators.required],
      pwd: [''],
      agentName: [''],
      address: [''],
      zipCode: [''],
      province: ['', Validators.required],
      city: [''],
      id: [''],
      customerNote: []
    });

    this.province = utilsService.getProvinceItaliane();
  }


  selectedWorkerId: number | null = null;

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    this.agentService.getAgents().subscribe((data: Agents[]) => {
      this.agents = data;
    });

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.title = "Aggiorna cliente";

        this.customerService.getCustomer(this.id)
          .subscribe((data: Customers) => {
            this.disciplinaryForm.patchValue({
              businessName: data.businessName,
              name: data.name,
              lastName: data.lastName,
              birthDate: data.birthDate,
              mobile: data.mobile,
              sdi: data.sdi,
              status: Number(data.status),
              email: data.email,
              pwd: data.pwd,
              vatNumber: data.vatNumber,
              agentName: data.agentName,
              address: data.address,
              zipCode: data.zipCode,
              province: data.province,
              city: data.city,
              id: this.id,
              customerNote: data.customerNote
            });
          });
      }
    });

  }

  returnBack(){
    this.router.navigate(["/customers"]);
  }

  
  onSubmit() {
    if (this.disciplinaryForm.valid) {
      const formData = {
        ...this.disciplinaryForm.value,
        status: Number(this.disciplinaryForm.value.status),   
        customerNote: this.disciplinaryForm.value.customerNote ?? ''   
      };

      const w: Customers = formData;

      if(this.id)
      {
        w._id = this.id;
        this.customerService.updateCustomer(w)
        .subscribe((data: boolean) => {
          if(data)
            this.router.navigate(["/customers"]);
          else
            console.log("errore");
        })
      }
      else
      {
        this.customerService.setCustomer(w)
        .subscribe((data: Customers) => {
          if(data)
            this.router.navigate(["/customers"]);
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
