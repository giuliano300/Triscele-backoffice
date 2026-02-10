import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ToggleService } from '../header/toggle.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';
import { MatBadgeModule } from '@angular/material/badge';
import { PermissionHolidayService } from '../../services/PermissionHoliday.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import { interval, Subscription } from 'rxjs';


@Component({
    selector: 'app-sidebar',
    imports: [NgScrollbarModule, MatExpansionModule, RouterLinkActive, RouterModule, RouterLink, NgClass, FeathericonsModule, NgIf, MatBadgeModule],
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
    isVisibleSectors: boolean = true;
    isVisibleAdmin: boolean = true;
    isVisibleOperatorOrders: boolean = false;
    isOfficeOperator: boolean = false;

    count:number = 0;

    constructor(
        private router: Router,
        private toggleService: ToggleService,
        private authService: AuthService,
        private permissionHolidayService: PermissionHolidayService,
        private socketService: SocketService
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
            const savedState = this.getLocal('persistentState');

            // Usa lo stato salvato se non esiste ancora in memoria
            if (!state && savedState) {
                state = savedState;
            }

            if (!state) return;

            if (state.isAdmin) {
                this.setAdminVisibility();
                localStorage.removeItem('persistentState');
            } 
            else 
            {
                this.saveLocal('persistentState', state);
            }

            if (!state.isOperator) return;

            this.authService.operator$.subscribe(operator => {
                const savedPerms = this.getLocal('persistentPermissions');

                // Se non c'è operator ma esistono permessi persistenti, li riutilizza
                if (!operator && savedPerms) {
                    operator = { permission: savedPerms };
                }

                if (!operator) {
                    localStorage.removeItem('persistentPermissions');
                    return;
                }

                this.isOperator = true;
                this.isAdmin = false;
                this.isVisibleSectors = false;
                this.isVisibleDashboard = false;
                this.isVisibleAdmin = false;
                this.isVisibleOrders = false;

                const permissions = operator.permission || [];
                this.saveLocal('persistentPermissions', permissions);

                this.applyPermissions(permissions);

                //console.log(permissions);
            });
        });

        this.countPending();
        // 🔹 Aggiorna il conteggio ogni volta che c’è una modifica
        this.permissionHolidayService.pendingChanged$.subscribe(() => {
            this.countPending();
        });

        this.socketService.absenceCounter$.subscribe(value => {
            this.count = value;
        });

    }

    countPending(){
        this.permissionHolidayService.countPending().subscribe((d: number) =>{
            this.count = d;
            this.socketService.setInitialCounter(d);
        })
    }


    /** Applica la visibilità dei moduli in base ai permessi */
    private applyPermissions(perms: any[]) {
        const has = (perm: string) => perms.some(p => p.permissionName === perm);

        this.isVisibleCustomers = has("CustomersModule");
        this.isVisibleOperators = has("OperatorsModule");
        this.isVisibleSuppliers = has("SuppliersModule");
        this.isVisibleProducts = has("ProductsModule");
        this.isVisibleOperatorOrders = has("OrdersModule");
        this.isOfficeOperator = has("OfficeOperatorsModule");

        //console.log(this.isOfficeOperator);

        this.isVisibleUsers = this.isVisibleCustomers || this.isVisibleOperators || this.isVisibleSuppliers;
        this.isVisibleProductions = this.isVisibleProducts || this.isVisibleOperatorOrders;
    }

    /** Set visibilità completa per admin */
    private setAdminVisibility() {
        this.isAdmin = true;
        this.isOperator = false;
        this.isVisibleOperatorOrders = false;
        this.isOfficeOperator = false;

        this.isVisibleDashboard = true;
        this.isVisibleCustomers = true;
        this.isVisibleOperators = true;
        this.isVisibleSuppliers = true;
        this.isVisibleUsers = true;
        this.isVisibleProductions = true;
        this.isVisibleProducts = true;
        this.isVisibleOrders = true;

    }

    /** Utility per leggere/scrivere su localStorage */
    private getLocal(key: string): any | null {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
    }

    private saveLocal(key: string, data: any): void {
        localStorage.setItem(key, JSON.stringify(data));
    }

    logout(){
        localStorage.removeItem('authToken');
        localStorage.removeItem('persistentState');
        localStorage.removeItem('persistentPermissions');
        localStorage.removeItem('permissions');
        localStorage.removeItem('user');
        localStorage.removeItem('operator');
        localStorage.removeItem('isLogin');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isOperator');
        localStorage.removeItem('role');
        this.authService.clearRoles();
        this.router.navigate(['/']);
    }

}