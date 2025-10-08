import { Component } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { Login } from '../../interfaces/Login';
import { UtilsService } from '../../services/utils.service';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/User.service';
import { JwtPayloads } from '../../interfaces/JwtPayloads';
import { OperatorService } from '../../services/Operator.service';
import { Permission } from '../../interfaces/permissions';

@Component({
    selector: 'app-sign-in',
    imports: [MatButton, MatIconButton, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, FeathericonsModule, MatCheckboxModule, 
        ReactiveFormsModule, NgIf],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
    isError: boolean = false;
    user: JwtPayloads | null = null;
    options: any [] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private utilsService: UtilsService,
        private authService: AuthService,
        private userService: UsersService,
        private operatorService: OperatorService
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(4)]]
        });
        this.options = [{id: 1, name: "Entity"}, {id: 2, name: "Location"}];
    }

    // Password Hide
    hide = true;

    // Form
    authForm: FormGroup;
    onSubmit() {
        if (this.authForm.valid) {
            let login:Login = {
                "email": this.authForm.value["email"],
                "password" : this.authForm.value["password"]
            };
            
            this.userService.login(login).subscribe((data: any) => {
                if(data == null)
                {
                    this.operatorService.loginOperator(login).subscribe((data: any) => {
                        if(data == null)
                         this.isError = true;
                        else
                        {
                            const o = this.authService.decodeToken(data)!
                            const login = this.operatorService.setOperatorAfterLogin(o, data);
                            
                            this.authService.setIsAdminState(false, true, o!.name!, true);

                            if(login)
                            {
                                const l = JSON.parse(localStorage.getItem("permissions") || "[]");
                                if(!l)
                                {
                                    localStorage.removeItem('authToken');
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('isLogin');
                                    localStorage.removeItem('isAdmin');
                                    localStorage.removeItem('isOperator');
                                    this.authService.clearRoles();
                                    this.router.navigate(['/']);
                                }
                            
                                const p: Permission = l[0];
                                switch(p.permissionName.toUpperCase()){
                                    case 'CUSTOMERSMODULE':
                                    this.router.navigate(['/customers']);
                                    break;
                                    case 'PRODUCTSMODULE':
                                    this.router.navigate(['/products']);
                                    break;
                                    case 'ORDERSMODULE':
                                    this.router.navigate(['/orders']);
                                    break;
                                    case 'OPERATORSSMODULE':
                                    this.router.navigate(['/operators']);
                                    break;
                                    case 'SUPPLIERSMODULE':
                                    this.router.navigate(['/suppliers']);
                                    break;
                                    default:
                                    this.router.navigate(['/dashboard']);
                                    break;
                                }
                            }
                        }
                    })
                }
                else
                {
                    this.user! = this.authService.decodeToken(data)!;
                    localStorage.setItem('isLogin', "true");
                    localStorage.setItem('isAdmin', "true");
                    localStorage.setItem('isOperator', "false");
                    localStorage.setItem('loginName', this.user!.name!);
                    this.authService.setIsLogin(true);
                    this.authService.setIsAdmin(true);
                    this.authService.setIsOperator(false);
                    this.authService.setLoginName(this.user!.name!);
                    localStorage.setItem('authTokenAdmin', data.access_token);
                    localStorage.setItem('authToken', data.access_token);
                    localStorage.setItem('user', JSON.stringify(this.user!));
                    localStorage.removeItem('operator');
                    localStorage.removeItem('permissions');
                    document.location.href = '/dashboard';
                }
            });
                        
        } 
        else 
        {
            console.log('Il modulo non è valido. Si prega di controllare i campi.');
        }
    }

    ngOnInit(): void {
        const token = localStorage.getItem('authToken');
        if (token)
            this.router.navigate(['/dashboard']);
   }
   

   passwordRecovery(){
        this.router.navigate(['/authentication/forgot-password']);
   }
}