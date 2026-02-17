import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AjusteInventario } from '../../app/interfaces/ajuste-inventario';

@Injectable({
  providedIn: 'root'
})
export class AjusteInventarioService {
  private apiUrl = 'https://tu-api.com/bodega/inventory/adjust/';

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos de ajuste a la API
   * @param ajuste El objeto con la información del conteo físico.
   * @returns Un Observable con la respuesta de la API.
   */
  realizarAjuste(ajuste: AjusteInventario): Observable<any> {
    return this.http.post(this.apiUrl, ajuste);
  }
}