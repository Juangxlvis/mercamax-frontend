export interface ValoracionInventario {
  producto_id: number;
  producto_nombre: string;   // backend devuelve 'producto_nombre'
  categoria: string;
  cantidad_total: number;    // backend devuelve 'cantidad_total'
  valor_total: number;       // backend devuelve 'valor_total'
}
