import { Component } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-pwd-recovery',
    imports: [MatButton, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, FeathericonsModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './pwd-recovery.component.html',
    styleUrl: './pwd-recovery.component.scss'
})
export class PwdRecoveryComponent {
    isError: boolean = false;
    isSuccess: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    // Password Hide
    hide = true;

    // Form
    authForm: FormGroup;
    onSubmit() {
        if (this.authForm.valid) 
        {
            this.isError = false;
            this.isSuccess = false;
            let recovery = {
                "email": this.authForm.value["email"]
            };
            
            this.authService.passwordRecovery(recovery).subscribe((data: boolean) => {
                if(!data)
                    this.isError = true;
                else
                    this.isSuccess = true;
            });
            
        } else {
            console.log('Form is invalid. Please check the fields.');
        }
    }

    ngOnInit(): void {
        const token = localStorage.getItem('authToken');
        const isEntity: boolean = localStorage.getItem('isEntity') === 'true';
        const isLocation: boolean = localStorage.getItem('isLocation') === 'true';
        if (token) 
            if(isEntity)
                this.router.navigate(['/locations']);
            if(isLocation)
                 this.router.navigate(['/plannings']);
   }
   

   havePassword(){
        this.router.navigate(['/authentication']);
   }
}