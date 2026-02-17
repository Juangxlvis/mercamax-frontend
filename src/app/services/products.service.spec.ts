import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoriaUbicacion } from '../../app/interfaces/categoria-ubicacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaubicacionService {

  private apiUrl = 'https://tu-api.com/bodega/categorias-ubicacion';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CategoriaUbicacion[]> {
    return this.http.get<CategoriaUbicacion[]>(this.apiUrl);
  }

  create(categoria: CategoriaUbicacion): Observable<CategoriaUbicacion> {
    return this.http.post<CategoriaUbicacion>(this.apiUrl, categoria);
  }

  update(id: number, categoria: CategoriaUbicacion): Observable<CategoriaUbicacion> {
    return this.http.put<CategoriaUbicacion>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}