import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllowedIp } from '../interfaces/allowed-ip';
import { API_URL } from '../../main';

@Injectable({ providedIn: 'root' })
export class AllowedIpService {

  private readonly apiUrl = API_URL + 'allowed-ips';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AllowedIp[]> {
    return this.http.get<AllowedIp[]>(this.apiUrl);
  }

  create(data: AllowedIp): Observable<AllowedIp> {
    return this.http.post<AllowedIp>(this.apiUrl, data);
  }

  update(data: AllowedIp): Observable<AllowedIp> {
    return this.http.put<AllowedIp>(`${this.apiUrl}/${data._id}`, data);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
