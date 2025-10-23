import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, FeathericonsModule, NgIf],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

    // Password Hide
    hide = true;
    isError = false;
    isSuccess = false;
    authForm: FormGroup;

    id!: string;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.authForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(4)]],
        });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.id = params['id'] || '';
            if(!params['id'])
                this.router.navigate(['/authentication']);
        });
    }

    onSubmit() {
        if (this.authForm.valid) {
            let recovery = {
                "pwd": this.authForm.value["password"],
                "id" : this.id
            };
            
            this.authService.passwordChange(recovery).subscribe((data: boolean) => {
                if(!data)
                    this.isError = true;
                else
                {
                    this.isSuccess = true;
                }
            });
            
        } else {
            console.log('Form is invalid. Please check the fields.');
        }
    }
}