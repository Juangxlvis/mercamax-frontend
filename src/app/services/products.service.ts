// src/app/products/products.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../app/interfaces/producto';
import { Proveedor } from '../../app/interfaces/proveedor';
import { CategoriaDropdown } from '../../app/interfaces/categoria-dropdown';
import { CategoriaProducto } from '../../app/interfaces/categoria-producto';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  //private apiUrl = 'http://localhost:8000/api/inventario/productos/';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { } 

  getCategories() {
  return this.http.get<{id:number, nombre:string}[]>('https://mercamax-backend.onrender.com/api/inventario/categorias');
}
  getProveedor(){
    return this.http.get<{id:number, nombre:string,contacto_nombre: string,
      telefono:string,email: string}[]> ('https://mercamax-backend.onrender.com/api/inventario/proveedores')
  }
  getEstadisticas(): Observable<any> {
  return this.http.get<any>('https://mercamax-backend.onrender.com/api/inventario/estadisticas');
}
  // C - Create (Crear un nuevo producto)
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // R - Read (Leer todos los productos)
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventario/productos/`);
  }
  
  // R - Read (Leer un solo producto por ID)
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}/`);
  }

  // U - Update (Actualizar un producto existente)
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/`, product);
  }

  // D - Delete (Borrar un producto)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}