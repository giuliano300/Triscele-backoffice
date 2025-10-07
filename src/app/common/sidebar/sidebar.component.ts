import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ToggleService } from '../header/toggle.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    imports: [NgScrollbarModule, MatExpansionModule, RouterLinkActive, RouterModule, RouterLink, NgClass, FeathericonsModule, NgIf],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    isVisibleDashboard: boolean = true;
    isVisibleCustomers: boolean = true;
    isVisibleOperators: boolean = true;
    isVisibleSuppliers: boolean = true;
    isVisibleUsers: boolean = true;
    isVisibleProductions: boolean = true;
    isVisibleProducts: boolean = true;
    isVisibleOrders: boolean = true;
    

    constructor(
        private router: Router,
        private toggleService: ToggleService,
        private authService: AuthService
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });

   }
    // Toggle Service
    isToggled = false;
    toggle() {
        this.toggleService.toggle();
    }

    // Mat Expansion
    panelOpenState = false;
    isOperator = false;
    isAdmin = true;

    ngOnInit() {

        this.authService.operatorState$.subscribe(state => {
            if (state) {
                if(state.isAdmin){
                    this.isVisibleDashboard = true;
                    this.isVisibleCustomers = true;
                    this.isVisibleOperators = true;
                    this.isVisibleSuppliers = true;
                    this.isVisibleUsers = true;
                    this.isVisibleProductions = true;
                    this.isVisibleProducts = true;
                    this.isVisibleOrders = true;
                }
                if(state.isOperator){
                    this.authService.operator$.subscribe(op => {
                        if(op)
                        {
                            this.isOperator = true;
                            this.isAdmin = false;

                            if(!this.isOperator)
                                this.logout();

                            this.isVisibleDashboard = false;
                            
                            const l = op.permission;

                            const hasCustomersModule = l.some((p: any) => p.permissionName === "CustomersModule");        
                            const hasOperatorsModule = l.some((p: any) => p.permissionName === "OperatorsModule");        
                            const hasSuppliersModule = l.some((p: any) => p.permissionName === "SuppliersModule");        
                            const hasProductsModule = l.some((p: any) => p.permissionName === "ProductsModule");        
                            const hasOrdersModule = l.some((p: any) => p.permissionName === "OrdersModule");        

                            if(!hasCustomersModule)
                                this.isVisibleCustomers = false;

                            if(!hasOperatorsModule)
                                this.isVisibleOperators = false;

                            if(!hasSuppliersModule)
                                this.isVisibleSuppliers = false;

                            if(!hasProductsModule)
                                this.isVisibleProducts = false;

                            if(!hasOrdersModule)
                                this.isVisibleOrders = false;

                            if(!hasCustomersModule && !hasOperatorsModule && !hasSuppliersModule)
                                this.isVisibleUsers = false;

                            if(!hasProductsModule && !hasOrdersModule)
                                this.isVisibleProductions = false;
                                
                        }

                    })
                }
            }
        });

    }

    logout(){
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('operator');
        localStorage.removeItem('isLogin');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isOperator');
        this.authService.clearRoles();
        this.router.navigate(['/']);
    }

}