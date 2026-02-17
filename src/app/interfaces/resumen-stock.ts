import { ValoracionInventario } from "./valoracion-inventario";

export interface ResumenStock {
    valor_total_inventario: number;
  detalles: ValoracionInventario[];

}