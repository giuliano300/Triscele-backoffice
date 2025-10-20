import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLogin = localStorage.getItem('isLogin') === 'true';
    const userRole = localStorage.getItem('role'); // 'admin' o 'operatore'
    const expectedRole = route.data['role'];      // ruolo richiesto dalla route

    if (!isLogin) {
      this.router.navigate(['/']);
      return false;
    }

    if (expectedRole && userRole !== expectedRole) {
      // se il ruolo non coincide, redirect a una pagina di accesso negato
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}
