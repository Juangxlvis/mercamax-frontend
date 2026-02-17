import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RotacionInventario } from '../../app/interfaces/rotacion-inventario';
import { ResumenStock } from '../../app/interfaces/resumen-stock';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
private apiUrl = 'https://tu-api.com/bodega/reports';

  constructor(private http: HttpClient) { }

  getValuacionInventario(): Observable<ResumenStock> {
    return this.http.get<ResumenStock>(`${this.apiUrl}/stock-valuation/`);
  }

  getRotacionInventario(): Observable<RotacionInventario> {
    return this.http.get<RotacionInventario>(`${this.apiUrl}/inventory-turnover/`);
}
}