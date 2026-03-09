import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StockItem } from '../interfaces/stock-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockItemService {
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/bodega/stockitems/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  create(stockItem: StockItem): Observable<StockItem> {
    return this.http.post<StockItem>(this.apiUrl, stockItem).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, stockItem: StockItem): Observable<StockItem> {
    return this.http.put<StockItem>(`${this.apiUrl}${id}/`, stockItem).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la solicitud.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage =
        error.error?.detail ||
        error.error?.non_field_errors?.[0] ||
        `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
