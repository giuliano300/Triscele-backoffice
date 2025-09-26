import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../interfaces/suppliers';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

    private apiUrl = API_URL + "Suppliers";
    
    constructor(private http: HttpClient) {}

    getSuppliers(): Observable<Supplier[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Supplier[]>(this.apiUrl, { headers });
    }

    getSupplier(id: string): Observable<Supplier>{
      return this.http.get<Supplier>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setSupplier(c: Supplier):Observable<Supplier>{
      return this.http.post<Supplier>(this.apiUrl, c);
    }

    updateSupplier(c: Supplier):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
