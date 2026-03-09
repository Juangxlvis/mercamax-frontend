export interface StockItem {
  id?: number;
  lote: number;
  lote_codigo?: string;       // solo lectura, viene del backend
  ubicacion: number;
  ubicacion_nombre?: string;  // solo lectura, viene del backend
  cantidad: number;
  producto_nombre?: string;   // solo lectura, viene del backend
}
