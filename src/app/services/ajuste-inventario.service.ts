import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AjusteInventario } from '../interfaces/ajuste-inventario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AjusteInventarioService {
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/bodega/inventory/adjust/`;

  constructor(private http: HttpClient) {}

  realizarAjuste(ajuste: AjusteInventario): Observable<any> {
    return this.http.post(this.apiUrl, ajuste).pipe(
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
        error.error?.error ||
        error.error?.non_field_errors?.[0] ||
        `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
