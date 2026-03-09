import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportesService } from '../services/reportes.service';
import { ResumenStock, RotacionInventario } from '../interfaces/resumen-stock';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class ReportesComponent {

  // Valoración
  valoracionData: ResumenStock | null = null;
  displayedColumns: string[] = ['producto_nombre', 'categoria', 'cantidad_total', 'valor_total'];
  loadingValoracion = false;

  // Rotación
  rotacionData: RotacionInventario | null = null;
  objetivoRotacion = 6;
  loadingRotacion = false;

  constructor(private reportesService: ReportesService) {}

  // ─── Valoración ───────────────────────────────────────────

  generarValoracion(): void {
    this.loadingValoracion = true;
    this.valoracionData = null;

    this.reportesService.getValuacionInventario().subscribe({
      next: (data: ResumenStock) => {
        this.valoracionData = data;
        this.loadingValoracion = false;
      },
      error: () => {
        this.loadingValoracion = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el reporte de valoración.', confirmButtonColor: '#00bf63' });
      }
    });
  }

  // ─── Rotación ─────────────────────────────────────────────

  calcularRotacion(): void {
    this.loadingRotacion = true;
    this.rotacionData = null;

    this.reportesService.getRotacionInventario().subscribe({
      next: (data: RotacionInventario) => {
        this.rotacionData = data;
        this.loadingRotacion = false;
      },
      error: () => {
        this.loadingRotacion = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo calcular la rotación.', confirmButtonColor: '#00bf63' });
      }
    });
  }

  get rotacionSuperaObjetivo(): boolean {
    return !!this.rotacionData && this.rotacionData.rotacion_de_inventario >= this.objetivoRotacion;
  }

  get periodoTexto(): string {
    if (!this.rotacionData) return '';
    return `${this.rotacionData.periodo_inicio} → ${this.rotacionData.periodo_fin}`;
  }

  // ─── Exportar Excel ───────────────────────────────────────

  exportarAExcel(): void {
    if (!this.valoracionData?.detalle_productos) return;

    const filas = this.valoracionData.detalle_productos.map(item => ({
      'Producto': item.producto_nombre,
      'Categoría': item.categoria,
      'Stock Total': item.cantidad_total,
      'Valor Total (COP)': item.valor_total
    }));

    // Agregar fila de total al final
    filas.push({
      'Producto': 'TOTAL',
      'Categoría': '',
      'Stock Total': 0,
      'Valor Total (COP)': this.valoracionData.valor_total_inventario
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Valoracion_Inventario');
    XLSX.writeFile(wb, 'reporte_valoracion_inventario.xlsx');
  }

  // ─── Exportar PDF ─────────────────────────────────────────

  exportarAPdf(): void {
    if (!this.valoracionData?.detalle_productos) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(39, 174, 96);
    doc.text('MercaMax — Reporte de Valoración de Inventario', 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 23);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Valor Total: COP ${this.valoracionData.valor_total_inventario.toLocaleString('es-CO')}`, 14, 32);

    autoTable(doc, {
      head: [['Producto', 'Categoría', 'Stock Total', 'Valor Total (COP)']],
      body: this.valoracionData.detalle_productos.map(item => [
        item.producto_nombre,
        item.categoria,
        item.cantidad_total.toString(),
        `COP ${item.valor_total.toLocaleString('es-CO')}`
      ]),
      startY: 38,
      headStyles: { fillColor: [39, 174, 96] },
      alternateRowStyles: { fillColor: [240, 255, 240] }
    });

    doc.save('reporte_valoracion_inventario.pdf');
  }
}
