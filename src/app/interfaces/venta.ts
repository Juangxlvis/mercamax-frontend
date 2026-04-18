// src/app/interfaces/venta.ts

export interface ProductoBuscado {
  stock_item_id: number;
  producto_nombre: string;
  codigo_barras: string;
  precio_venta: string;
  porcentaje_iva: string;
  stock_disponible: number;
  ubicacion: string;
  lote_codigo: string;
}

export interface ItemCarrito {
  stock_item_id: number;
  producto_nombre: string;
  precio_venta: number;
  porcentaje_iva: number;
  stock_disponible: number;
  cantidad: number;
  subtotal: number;
  impuesto: number;
  total_linea: number;
}

export interface Cliente {
  id?: number;
  nombre: string;
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'PAS';
  numero_documento: string;
  telefono?: string;
  email?: string;
}

export interface CrearVentaPayload {
  cliente_id: number | null;
  notas: string;
  metodo_pago: string;
  items: { stock_item_id: number; cantidad: number }[];
}

export interface DetalleVenta {
  id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: string;
  porcentaje_iva: string;
  subtotal: string;
  impuesto: string;
  total_linea: string;
}

export interface Factura {
  id: number;
  numero_factura: string;
  fecha_emision: string;
}

export interface Venta {
  id: number;
  cajero_nombre: string;
  cliente_nombre: string | null;
  fecha_hora: string;
  estado: 'COMPLETADA' | 'ANULADA';
  metodo_pago: string;
  metodo_pago_display: string;
  subtotal: string;
  total_impuestos: string;
  total: string;
  notas: string;
  factura: Factura;
  detalles: DetalleVenta[];
}

export interface ProductoForm {
  porcentaje_iva: number;
}
