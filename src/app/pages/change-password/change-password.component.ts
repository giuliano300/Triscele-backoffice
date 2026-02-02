import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FeathericonsModule
]
})
export class ChangePasswordComponent {

  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,  private toastr: ToastrService) {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.changePasswordForm
      .get('oldPassword')
      ?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.checkOldPassword(value);
      });
  }

  checkOldPassword(value: string) {
    let admin: any = JSON.parse(localStorage.getItem('user')!);
    const control = this.changePasswordForm.get('oldPassword');

    if (!value || !control || control.hasError('required')) {
      return;
    }

    this.authService.checkOldPassword({
      userId: admin!.sub,       // se vuoi passarlo
      oldPassword: value
    }).subscribe(isValid => {

      if (!isValid) {
        control.setErrors({ ...control.errors, wrongPassword: true });
      } else {
        if (control.errors) {
          delete control.errors['wrongPassword'];

          if (Object.keys(control.errors).length === 0) {
            control.setErrors(null);
          }
        }
      }
    });
  }


  get f() {
    return this.changePasswordForm.controls;
  }

  passwordMatchValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) return;
  
    this.changePasswordForm.disable();
    setTimeout(() => this.changePasswordForm.enable(), 2000);

    let admin: any = JSON.parse(localStorage.getItem('user')!);

    const payload = {
      pwd: this.changePasswordForm.get('newPassword')?.value,
      id: admin.sub
    };

    this.authService.passwordChange(payload).subscribe((data: boolean) => {
        if(!data)
           this.toastr.success(
            'Impossibile cambiare la password',
            'Errore'
          );
        else
        {
          // ✅ reset completo del form
          this.changePasswordForm.reset();
          this.toastr.success(
            'Password aggiornata correttamente',
            'Operazione completata'
          );
        }
    });
    }
}
