// src/app/services/ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoBuscado, Cliente, CrearVentaPayload, Venta } from '../interfaces/venta';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  buscarProducto(query: string): Observable<ProductoBuscado[]> {
    return this.http.get<ProductoBuscado[]>(`${this.apiUrl}/buscar-producto/?q=${query}`);
  }

  crearVenta(payload: CrearVentaPayload): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/crear/`, payload);
  }

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/`);
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}/`);
  }

  anularVenta(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/anular/`, {});
  }

  descargarPdf(ventaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ventaId}/pdf/`, { responseType: 'blob' });
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes/`);
  }

  buscarCliente(query: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes/buscar/?q=${query}`);
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes/`, cliente);
  }
}
