import { Product } from "./producto";

export interface Lote {
  id?: number;
  producto: number;
  producto_nombre?: string; // campo de solo lectura que devuelve el backend
  codigo_lote: string;
  fecha_caducidad: string;  // formato 'YYYY-MM-DD'
  fecha_recepcion?: string; // auto generado por el backend, solo lectura
  costo_unitario: number;
  cantidad_inicial: number;
  cantidad_sin_ubicar?: number; // calculado por el backend, solo lectura
}
