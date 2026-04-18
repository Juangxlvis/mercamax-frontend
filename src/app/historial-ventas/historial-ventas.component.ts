// src/app/historial-ventas/historial-ventas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { VentasService } from '../services/ventas.service';
import { AuthService } from '../services/auth.service';
import { Venta } from '../interfaces/venta';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './historial-ventas.component.html',
  styleUrls: ['./historial-ventas.component.scss']
})
export class HistorialVentasComponent implements OnInit {

  ventas: Venta[] = [];
  ventaSeleccionada: Venta | null = null;
  cargando = false;
  descargando = false;
  esGerente = false;

  constructor(
    private ventasService: VentasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.hasRole(['GERENTE_SUPERMERCADO']).subscribe(es => {
      this.esGerente = es;
    });
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando = true;
    this.ventasService.getVentas().subscribe({
      next: (data) => { this.ventas = data; this.cargando = false; },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo cargar el historial de ventas.', 'error');
      }
    });
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada = null;
  }

  anularVenta(venta: Venta): void {
    Swal.fire({
      title: '¿Anular esta venta?',
      html: `
        <p>Factura: <strong>${venta.factura?.numero_factura}</strong></p>
        <p>Esta acción devolverá el stock automáticamente.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e74c3c'
    }).then(result => {
      if (result.isConfirmed) {
        this.ventasService.anularVenta(venta.id).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Venta anulada y stock devuelto',
              showConfirmButton: false, timer: 2500
            });
            this.ventaSeleccionada = null;
            this.cargarVentas();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.error || 'No se pudo anular la venta.', 'error');
          }
        });
      }
    });
  }

  // ✅ Descarga el PDF de la factura
  descargarPdf(venta: Venta, event?: MouseEvent): void {
    event?.stopPropagation();
    this.descargando = true;

    this.ventasService.descargarPdf(venta.id).subscribe({
      next: (blob) => {
        this.descargando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${venta.factura?.numero_factura || venta.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.descargando = false;
        Swal.fire({
          toast: true, position: 'top-end', icon: 'error',
          title: 'Error al descargar el PDF',
          showConfirmButton: false, timer: 2500
        });
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  fmt(valor: string | number): string {
    return Number(valor).toLocaleString('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  // Alias para mantener compatibilidad con el HTML anterior
  formatearPrecio(valor: string | number): string {
    return this.fmt(valor);
  }

  // Calcula si una venta tiene IVA para mostrar el desglose
  tieneIva(venta: Venta): boolean {
    return parseFloat(venta.total_impuestos) > 0;
  }

  getLabelMetodoPago(metodo: string): string {
    const labels: Record<string, string> = {
      'EFECTIVO': '💵 Efectivo',
      'TARJETA_CREDITO': '💳 Tarjeta de Crédito',
      'TARJETA_DEBITO': '💳 Tarjeta de Débito',
      'TRANSFERENCIA': '🏦 Transferencia'
    };
    return labels[metodo] || metodo;
  }
}
