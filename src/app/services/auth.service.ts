import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtPayloads } from '../interfaces/JwtPayloads';
import { jwtDecode } from 'jwt-decode';
import { Operators } from '../interfaces/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoginSubject = new BehaviorSubject<boolean>(this.getBooleanFromStorage('isLogin'));
  private isAdminSubject = new BehaviorSubject<boolean>(this.getBooleanFromStorage('isAdmin'));
  private isOperatorSubject = new BehaviorSubject<boolean>(this.getBooleanFromStorage('isOperator'));
  private loginNameSubject = new BehaviorSubject<string>("");

  private operatorSubject = new BehaviorSubject<any | null>(null);
  operator$ = this.operatorSubject.asObservable();

  private operatorState = new BehaviorSubject<{ isAdmin: boolean; isOperator: boolean; name: string } | null>(null);
  operatorState$ = this.operatorState.asObservable();

  constructor(private http: HttpClient) { }

  // Osservabili pubblici
  isLogin$ = this.isLoginSubject.asObservable();
  loginName$ = this.loginNameSubject.asObservable();
  isAdmin$ = this.isAdminSubject.asObservable();
  isOperator$ = this.isOperatorSubject.asObservable();

  setLoginName(value: string) {
    localStorage.setItem('loginName', JSON.stringify(value));
    this.loginNameSubject.next(value);
  }

  setIsLogin(value: boolean) {
    localStorage.setItem('isLogin', JSON.stringify(value));
    this.isLoginSubject.next(value);
  }

  setIsAdmin(value: boolean) {
    localStorage.setItem('isAdmin', JSON.stringify(value));
    this.isLoginSubject.next(value);
  }

  setIsOperator(value: boolean) {
    localStorage.setItem('isOperator', JSON.stringify(value));
    this.isLoginSubject.next(value);
  }

  setOperator(operator: Operators) {
    this.operatorSubject.next(operator);
    localStorage.setItem('operator', JSON.stringify(operator));
  }

  decodeToken(token: any): JwtPayloads | null {
    try {
      const decoded = jwtDecode<JwtPayloads>(token.access_token);
      return decoded;
    } catch (error) {
      console.error('Errore decodifica JWT', error);
      return null;
    }
  }

  setIsAdminState(isAdmin: boolean, isOperator: boolean, name: string) {
    this.operatorState.next({ isAdmin, isOperator, name });
  }
    
  // Pulisce i ruoli
  clearRoles() {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('loginName');
    this.isLoginSubject.next(false);
    this.loginNameSubject.next("");
  }

  // Legge da localStorage
  private getBooleanFromStorage(key: string): boolean {
    return localStorage.getItem(key) === 'true';
  }

}
