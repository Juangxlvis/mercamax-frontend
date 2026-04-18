// src/app/punto-venta/punto-venta.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { VentasService } from '../services/ventas.service';
import { ProductoBuscado, ItemCarrito, Cliente, CrearVentaPayload } from '../interfaces/venta';

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.scss']
})
export class PuntoVentaComponent implements OnInit {

  metodosPago = [
    { value: 'EFECTIVO', label: '💵 Efectivo' },
    { value: 'TARJETA_CREDITO', label: '💳 Tarjeta de Crédito' },
    { value: 'TARJETA_DEBITO', label: '💳 Tarjeta de Débito' },
    { value: 'TRANSFERENCIA', label: '🏦 Transferencia' },
  ];

  // Búsqueda productos
  queryProducto = '';
  resultadosProducto: ProductoBuscado[] = [];
  buscandoProducto = false;
  private searchProducto$ = new Subject<string>();

  // Carrito
  carrito: ItemCarrito[] = [];

  // Cliente
  queryCliente = '';
  resultadosCliente: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;
  mostrarBuscadorCliente = false;
  busquedaClienteRealizada = false;
  private searchCliente$ = new Subject<string>();

  // Quick Create
  mostrarPanelCliente = false;
  guardandoCliente = false;
  nuevoCliente: Cliente = { nombre: '', tipo_documento: 'CC', numero_documento: '', telefono: '', email: '' };

  // Pago
  metodoPago = 'EFECTIVO';
  notas = '';
  procesandoVenta = false;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.searchProducto$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => {
      q.trim().length >= 2 ? this.buscarProducto(q) : (this.resultadosProducto = []);
    });
    this.searchCliente$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => {
      if (q.trim().length >= 2) {
        this.buscarCliente(q);
      } else {
        this.resultadosCliente = [];
        this.busquedaClienteRealizada = false;
      }
    });
  }

  onQueryProductoChange(): void { this.searchProducto$.next(this.queryProducto); }
  onQueryClienteChange(): void {
    this.busquedaClienteRealizada = false;
    this.searchCliente$.next(this.queryCliente);
  }

  buscarProducto(q: string): void {
    this.buscandoProducto = true;
    this.ventasService.buscarProducto(q).subscribe({
      next: (data) => { this.resultadosProducto = data; this.buscandoProducto = false; },
      error: () => { this.buscandoProducto = false; }
    });
  }

  buscarCliente(q: string): void {
    this.ventasService.buscarCliente(q).subscribe({
      next: (data) => { this.resultadosCliente = data; this.busquedaClienteRealizada = true; }
    });
  }

  agregarAlCarrito(producto: ProductoBuscado): void {
    const iva = parseFloat(producto.porcentaje_iva);
    const precio = parseFloat(producto.precio_venta);
    const existente = this.carrito.find(i => i.stock_item_id === producto.stock_item_id);

    if (existente) {
      if (existente.cantidad < producto.stock_disponible) {
        existente.cantidad++;
        this.recalcularLinea(existente);
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning',
          title: `Stock máximo: ${producto.stock_disponible}`, showConfirmButton: false, timer: 2000 });
      }
    } else {
      const item: ItemCarrito = {
        stock_item_id: producto.stock_item_id,
        producto_nombre: producto.producto_nombre,
        precio_venta: precio,
        porcentaje_iva: iva,
        stock_disponible: producto.stock_disponible,
        cantidad: 1,
        subtotal: precio,
        impuesto: precio * (iva / 100),
        total_linea: precio + precio * (iva / 100)
      };
      this.carrito.push(item);
    }
    this.queryProducto = '';
    this.resultadosProducto = [];
  }

  recalcularLinea(item: ItemCarrito): void {
    item.subtotal = item.cantidad * item.precio_venta;
    item.impuesto = item.subtotal * (item.porcentaje_iva / 100);
    item.total_linea = item.subtotal + item.impuesto;
  }

  cambiarCantidad(item: ItemCarrito, delta: number): void {
    const nueva = item.cantidad + delta;
    if (nueva < 1) { this.eliminarDelCarrito(item); return; }
    if (nueva > item.stock_disponible) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning',
        title: `Stock máximo: ${item.stock_disponible}`, showConfirmButton: false, timer: 2000 });
      return;
    }
    item.cantidad = nueva;
    this.recalcularLinea(item);
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    this.carrito = this.carrito.filter(i => i.stock_item_id !== item.stock_item_id);
  }

  // ─── Totales calculados dinámicamente ────────────────────────
  get subtotalCarrito(): number {
    return this.carrito.reduce((acc, i) => acc + i.subtotal, 0);
  }

  get impuestosCarrito(): number {
    return this.carrito.reduce((acc, i) => acc + i.impuesto, 0);
  }

  get totalCarrito(): number {
    return this.subtotalCarrito + this.impuestosCarrito;
  }

  get hayImpuestos(): boolean {
    return this.impuestosCarrito > 0;
  }

  // ─── Cliente ─────────────────────────────────────────────────
  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.queryCliente = '';
    this.resultadosCliente = [];
    this.mostrarBuscadorCliente = false;
    this.busquedaClienteRealizada = false;
  }

  quitarCliente(): void { this.clienteSeleccionado = null; }

  abrirPanelNuevoCliente(): void {
    this.nuevoCliente = { nombre: '', tipo_documento: 'CC',
      numero_documento: this.queryCliente.trim(), telefono: '', email: '' };
    this.mostrarPanelCliente = true;
  }

  cerrarPanelCliente(): void { this.mostrarPanelCliente = false; this.guardandoCliente = false; }

  guardarNuevoCliente(): void {
    if (!this.nuevoCliente.nombre.trim() || !this.nuevoCliente.numero_documento.trim()) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning',
        title: 'Nombre y documento son obligatorios.', showConfirmButton: false, timer: 2500 });
      return;
    }
    this.guardandoCliente = true;
    this.ventasService.crearCliente(this.nuevoCliente).subscribe({
      next: (c) => {
        this.guardandoCliente = false;
        this.cerrarPanelCliente();
        this.seleccionarCliente(c);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success',
          title: `"${c.nombre}" creado y seleccionado`, showConfirmButton: false, timer: 2500 });
      },
      error: (err) => {
        this.guardandoCliente = false;
        Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.numero_documento?.[0] || err.error?.detail || 'Error al crear cliente.' });
      }
    });
  }

  // ─── Venta ───────────────────────────────────────────────────
  confirmarVenta(): void {
    if (this.carrito.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Carrito vacío' }); return;
    }

    const labelMetodo = this.metodosPago.find(m => m.value === this.metodoPago)?.label || '';

    Swal.fire({
      title: '¿Confirmar venta?',
      html: `
        <div style="text-align:left;font-size:14px">
          <div style="display:flex;justify-content:space-between;padding:4px 0">
            <span>Subtotal:</span><strong>${this.fmt(this.subtotalCarrito)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;color:#888">
            <span>Impuestos (IVA):</span><strong>${this.fmt(this.impuestosCarrito)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:17px;border-top:2px solid #eee;margin-top:6px">
            <span>TOTAL:</span><strong style="color:#27AE60">${this.fmt(this.totalCarrito)}</strong>
          </div>
          <div style="margin-top:8px;color:#555">
            Cliente: <strong>${this.clienteSeleccionado?.nombre || 'Anónimo'}</strong><br>
            Pago: <strong>${labelMetodo}</strong>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Venta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#27AE60'
    }).then(r => { if (r.isConfirmed) this.procesarVenta(); });
  }

  procesarVenta(): void {
    this.procesandoVenta = true;
    const payload: CrearVentaPayload = {
      cliente_id: this.clienteSeleccionado?.id || null,
      notas: this.notas,
      metodo_pago: this.metodoPago,
      items: this.carrito.map(i => ({ stock_item_id: i.stock_item_id, cantidad: i.cantidad }))
    };

    this.ventasService.crearVenta(payload).subscribe({
      next: (venta) => {
        this.procesandoVenta = false;
        Swal.fire({
          icon: 'success', title: '¡Venta registrada!',
          html: `
            <p>Factura: <strong>${venta.factura?.numero_factura}</strong></p>
            <p>Total: <strong>${this.fmt(parseFloat(venta.total))}</strong></p>
          `,
          confirmButtonColor: '#27AE60',
          showDenyButton: true,
          denyButtonText: '📄 Descargar PDF',
          denyButtonColor: '#2980b9',
        }).then(r => { if (r.isDenied) this.descargarPdf(venta.id); });
        this.limpiarVenta();
      },
      error: (err) => {
        this.procesandoVenta = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.error || 'Error inesperado.' });
      }
    });
  }

  descargarPdf(ventaId: number): void {
    this.ventasService.descargarPdf(ventaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `factura_${ventaId}.pdf`; a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire({ toast: true, position: 'top-end', icon: 'error',
        title: 'Error al descargar PDF', showConfirmButton: false, timer: 2500 })
    });
  }

  limpiarVenta(): void {
    this.carrito = [];
    this.clienteSeleccionado = null;
    this.metodoPago = 'EFECTIVO';
    this.notas = '';
    this.queryProducto = '';
    this.queryCliente = '';
    this.resultadosProducto = [];
    this.resultadosCliente = [];
    this.busquedaClienteRealizada = false;
  }

  fmt(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }
}
