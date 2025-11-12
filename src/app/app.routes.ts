import { Routes } from '@angular/router';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { AddCustomerComponent } from './pages/customers/add/add-customer.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { AddSupplierComponent } from './pages/suppliers/add/add-supplier.component';
import { OperatorsComponent } from './pages/operators/operators.component';
import { AddOperatorComponent } from './pages/operators/add/add-operator.component';
import { CategoriesComponent } from './pages/products/categories/categories.component';
import { ProductsComponent } from './pages/products/products.component';
import { AddProductComponent } from './pages/products/add/add-update-product.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AddOrderComponent } from './pages/orders/add-order/add-order.component';
import { SectorsComponent } from './pages/sectors/sectors.component';
import { QuotationsComponent } from './pages/orders/quotations/quotations.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { OrderStateComponent } from './pages/order-state/order-state.component';
import { OperatorOrdersComponent } from './pages/orders/operator-orders/operator-orders.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RoleGuard } from './authGuard/AuthGuard';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { PwdRecoveryComponent } from './authentication/pwd-recovery/pwd-recovery.component';
import { OptionsComponent } from './pages/products/options/options.component';
import { CalendarComponent } from './pages/operators/calendar.component';
import { PermissionHolidayComponent } from './pages/operators/permission-holiday/permission-holiday.component';
import { IllnessComponent } from './pages/operators/illness/illness.component';
import { AddIllnessComponent } from './pages/operators/illness/add/add-illness.component';
import { AddPermissionHolidayComponent } from './pages/operators/permission-holiday/add/add-permission-holiday.component';

export const routes: Routes = [
    { path: '', redirectTo : '/authentication', pathMatch: 'full' },
    {
        path: 'authentication',
        component: AuthenticationComponent,
        children: [
            {path: '', component: SignInComponent},
        ]
    },
    {
        path: '',
        children: [
            { path: 'dashboard', 
                component: DashboardComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
             },
            { path: 'customers', component: CustomersComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] } 
            },
            { path: 'customer/add/:id', component: AddCustomerComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] } 
            },
            { path: 'customer/add', component: AddCustomerComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] } 
            },
            { path: 'suppliers', component: SuppliersComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'supplier/add/:id', component: AddSupplierComponent ,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'supplier/add', component: AddSupplierComponent ,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'operators', component: OperatorsComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
                
            },
            { path: 'operator/calendar', component: CalendarComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/permission-holiday', component: PermissionHolidayComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/permission-holiday/add', component: AddPermissionHolidayComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/permission-holiday/add/:id', component: AddPermissionHolidayComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/illness', component: IllnessComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/illness/add', component: AddIllnessComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/illness/add/:id', component: AddIllnessComponent,
                canActivate: [RoleGuard],
                data: { roles: ['operatore'] }
                
            },
            { path: 'operator/add/:id', component: AddOperatorComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'operator/add', component: AddOperatorComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'agents', component: AgentsComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'categories', component: CategoriesComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'sectors', component: SectorsComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'order-state', component: OrderStateComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'products', component: ProductsComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore']  }
            },
            { path: 'product/add/:id', component: AddProductComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore']  }
            },
            { path: 'product/add', component: AddProductComponent,
                canActivate: [RoleGuard],
                data: { roles: ['admin', 'operatore'] }
            },
            { path: 'products/options', component: OptionsComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'orders', component: OrdersComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'operator-orders', component: OperatorOrdersComponent,
                canActivate: [RoleGuard],
                data: { role: 'operatore' }
            },
            { path: 'quotations', component: QuotationsComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'order/add/:id', component: AddOrderComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            { path: 'order/add', component: AddOrderComponent,
                canActivate: [RoleGuard],
                data: { role: 'admin' }
            },
            {
                path: 'access-denied',
                component: AccessDeniedComponent
            },
            {
                path: 'authentication/reset-password',
                component: ResetPasswordComponent
            },
            {
                path: 'authentication/pwd-recovery',
                component: PwdRecoveryComponent
            }
        ]
    },
    { path: '**', component: NotFoundComponent},
];
