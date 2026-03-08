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

  private baseUrl = environment.apiUrl;

  private productsUrl = `${this.baseUrl}/inventario/productos/`;
  private categoriasUrl = `${this.baseUrl}/inventario/categorias/`;
  private proveedoresUrl = `${this.baseUrl}/inventario/proveedores/`;
  private estadisticasUrl = `${this.baseUrl}/inventario/estadisticas/`;

  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get<{id:number, nombre:string}[]>(this.categoriasUrl);
  }

getProveedor(): Observable<Proveedor[]> {
  return this.http.get<Proveedor[]>(
    `${environment.apiUrl}/inventario/proveedores/`
  );
}

  getEstadisticas(){
    return this.http.get(this.estadisticasUrl);
  }

  getProducts(){
    return this.http.get<Product[]>(this.productsUrl);
  }

  createProduct(product: Product){
    return this.http.post<Product>(this.productsUrl, product);
  }

  getProductById(id:number){
    return this.http.get<Product>(`${this.productsUrl}${id}/`);
  }

  updateProduct(id:number, product:Product){
    return this.http.put<Product>(`${this.productsUrl}${id}/`, product);
  }

  deleteProduct(id:number){
    return this.http.delete(`${this.productsUrl}${id}/`);
  }
}