// services/categoriaubicacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoriaUbicacion } from '../interfaces/categoria-ubicacion';

@Injectable({
  providedIn: 'root'
})
export class CategoriaubicacionService {
  private apiUrl = 'http://localhost:8000/api/bodega/categorias-ubicacion/';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CategoriaUbicacion[]> {
    return this.http.get<CategoriaUbicacion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la solicitud.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = error.error?.detail || error.error?.non_field_errors?.[0] || `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}