import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Ubicacion } from '../../app/interfaces/ubicacion';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
 private apiUrl = 'http://localhost:8000/api/bodega/ubicaciones/';
 private tiposUrl = 'http://localhost:8000/api/bodega/tipos-ubicacion/';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getTipos(): Observable<{ value: string, label: string }[]> {
    return this.http.get<{ value: string, label: string }[]>(this.tiposUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  create(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.apiUrl, ubicacion).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}${id}/`, ubicacion).pipe(
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
      errorMessage = error.error?.detail || error.error?.non_field_errors?.[0] || `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

}