import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private apiUrl = API_URL + "stats";

  constructor(private http: HttpClient) {}

  getStats(year?: number): Observable<any> {
    const url = year ? `${this.apiUrl}?year=${year}` : this.apiUrl;
    return this.http.get(url);
  }
}
