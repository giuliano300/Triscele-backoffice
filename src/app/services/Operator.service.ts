import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operators } from '../interfaces/operators';
import { Login } from '../interfaces/Login';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

    private apiUrl = API_URL + "Operators";
    private apiUrlLogin = API_URL + "auth/loginOperator";
    
    constructor(private http: HttpClient, private authService: AuthService) {}

    getOperators(): Observable<Operators[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Operators[]>(this.apiUrl, { headers });
    }

    getOperator(id: string): Observable<Operators>{
      return this.http.get<Operators>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setOperator(c: Operators):Observable<Operators>{
      return this.http.post<Operators>(this.apiUrl, c);
    }

    updateOperator(c: Operators):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

    loginOperator(c: Operators): Observable<Operators>{
      const login: Login = {
        email : c.email,
        password: c.pwd
      };
      return this.http.post<Operators>(this.apiUrlLogin, login);
    }

    setOperatorAfterLogin(c: any, data: any): boolean{

      this.authService.setOperator(c);

      localStorage.setItem('isLogin', "true");
      localStorage.setItem('isAdmin', "false");
      localStorage.setItem('isOperator', "true");
      localStorage.setItem('loginName', c.name!);
      this.authService.setIsLogin(true);
      this.authService.setIsAdmin(false);
      this.authService.setIsOperator(true);
      this.authService.setLoginName(c.name!);
      localStorage.setItem('authToken', data);
      localStorage.setItem('operator', JSON.stringify(c));
      localStorage.setItem('permissions', JSON.stringify(c.permission));

      return true;
    }

}
