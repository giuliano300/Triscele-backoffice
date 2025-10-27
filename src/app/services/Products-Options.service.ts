import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsOptions } from '../interfaces/productsOptions';

@Injectable({
  providedIn: 'root'
})
export class ProductsOptionsService {

    private apiUrl = API_URL + "productsOptions";
    
    constructor(private http: HttpClient) {}

    getProductsOptions(): Observable<ProductsOptions[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<ProductsOptions[]>(this.apiUrl, { headers });
    }

    getProductsOption(id: string): Observable<ProductsOptions>{
      return this.http.get<ProductsOptions>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setProductsOptions(c: ProductsOptions):Observable<ProductsOptions>{
      return this.http.post<ProductsOptions>(this.apiUrl, c);
    }

    updateProductsOptions(c: ProductsOptions):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
