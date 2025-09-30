import { Routes } from '@angular/router';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './authGuard/AuthGuard';
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
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'customers', component: CustomersComponent },
            { path: 'customer/add/:id', component: AddCustomerComponent },
            { path: 'customer/add', component: AddCustomerComponent },
            { path: 'suppliers', component: SuppliersComponent },
            { path: 'supplier/add/:id', component: AddSupplierComponent },
            { path: 'supplier/add', component: AddSupplierComponent },
            { path: 'operators', component: OperatorsComponent },
            { path: 'operator/add/:id', component: AddOperatorComponent },
            { path: 'operator/add', component: AddOperatorComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'product/add/:id', component: AddProductComponent },
            { path: 'product/add', component: AddProductComponent },
            { path: 'orders', component: OrdersComponent },
        ]
    },
    { path: '**', component: NotFoundComponent},
];
