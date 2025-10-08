import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/products';
import { ProductViewModel } from '../classess/productViewModel';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    private apiUrl = API_URL + "Products";
    
    constructor(private http: HttpClient) {}

    getProducts(query: string = ''): Observable<ProductViewModel[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<ProductViewModel[]>(this.apiUrl + query, { headers });
    }

    findLowStock(): Observable<ProductViewModel[]>{
      return this.http.get<ProductViewModel[]>(this.apiUrl + "/findLowStock");
    }

    findProductsForSelect(): Observable<any[]>{
      return this.http.get<any[]>(this.apiUrl + "/findProductsForSelect");
    }

    getProductsByName(name: string): Observable<ProductViewModel[]> {
      const params = new HttpParams().set('name', name);
      return this.http.get<ProductViewModel[]>(`${this.apiUrl}/findProductsByName`, { params });
    }
  
    getProduct(id: string): Observable<ProductViewModel>{
      return this.http.get<ProductViewModel>(this.apiUrl + "/" + id);
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

