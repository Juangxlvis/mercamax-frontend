import { ValoracionInventario } from "./valoracion-inventario";

export interface ResumenStock {
  valor_total_inventario: number;
  detalle_productos: ValoracionInventario[];  // backend devuelve 'detalle_productos', no 'detalles'
}

export interface RotacionInventario {
  periodo_inicio: string;     // backend devuelve 'periodo_inicio'
  periodo_fin: string;        // backend devuelve 'periodo_fin'
  costo_de_ventas: number;
  inventario_promedio_estimado: number;  // backend devuelve 'inventario_promedio_estimado'
  rotacion_de_inventario: number;
  objetivo_metrica: string;
}
