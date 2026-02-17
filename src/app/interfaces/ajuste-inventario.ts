export interface AjusteInventario {
    stock_item_id: number;
    cantidad_contada: number;
    motivo: string;
    notas?: string; 
}