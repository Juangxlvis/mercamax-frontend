import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lote } from '../interfaces/lote';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/bodega/lotes/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  create(lote: Lote): Observable<Lote> {
    return this.http.post<Lote>(this.apiUrl, lote).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.apiUrl}${id}/`, lote).pipe(
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
