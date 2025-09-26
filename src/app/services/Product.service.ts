import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    private apiUrl = API_URL + "Products";
    
    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Product[]>(this.apiUrl, { headers });
    }

    getProduct(id: string): Observable<Product>{
      return this.http.get<Product>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setProduct(c: Product):Observable<Product>{
      return this.http.post<Product>(this.apiUrl, c);
    }

    updateProduct(c: Product):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}

