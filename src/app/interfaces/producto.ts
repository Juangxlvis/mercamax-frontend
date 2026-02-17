import { CategoriaProducto } from "./categoria-producto";
import { Proveedor } from "./proveedor";

// src/app/products/product.interface.ts
export interface Product {
   id?: number;
  nombre: string;
  codigo_barras: string;
  descripcion: string;
  precio_venta: number;
  stock_minimo: number;

  // Los campos de relación ahora guardan el ID (un número)
  categoria: number; 
  proveedor: number;

  // Los nuevos campos calculados que envía el backend
  stock_total?: number;
  costo_promedio_ponderado?: number;

}