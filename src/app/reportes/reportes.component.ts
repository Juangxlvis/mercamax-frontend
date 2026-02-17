import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../services/reportes.service';



// Para exportar a CSV/PDF
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ResumenStock } from '../interfaces/resumen-stock';
import { RotacionInventario } from '../interfaces/rotacion-inventario';

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
    MatIconModule
  ]
})
export class ReportesComponent implements OnInit {

  // Valoración de Inventario
  valoracionData: ResumenStock | null = null;
  displayedColumns: string[] = ['producto', 'stock_total', 'costo_promedio', 'valor_total'];

  // Rotación de Inventario
  rotacionData: RotacionInventario | null = null;
  objetivoRotacion = 6;

  constructor(private reportesService: ReportesService) { }

  ngOnInit(): void {
    // Puedes cargar los reportes al inicio o solo con los botones
    // this.generarValoracion();
    // this.calcularRotacion();
  }

  generarValoracion(): void {
    this.reportesService.getValuacionInventario().subscribe(
      (data: ResumenStock) => {
        this.valoracionData = data;
      },
      (error) => {
        console.error('Error al generar el reporte de valoración:', error);
      }
    );
  }

  calcularRotacion(): void {
    this.reportesService.getRotacionInventario().subscribe(
      (data: RotacionInventario) => {
        this.rotacionData = data;
      },
      (error) => {
        console.error('Error al calcular la rotación:', error);
      }
    );
  }
  
  // ➡️ Métodos para exportar
  exportarAExcel(): void {
    if (!this.valoracionData || !this.valoracionData.detalles) return;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.valoracionData.detalles);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Valoracion_Inventario');
    XLSX.writeFile(wb, 'reporte_valoracion_inventario.xlsx');
  }

  exportarAPdf(): void {
    if (!this.valoracionData || !this.valoracionData.detalles) return;
    
    const doc = new jsPDF();
    const headers = [['Producto', 'Stock Total', 'Costo Promedio', 'Valor Total']];
    const data = this.valoracionData.detalles.map(item => [
      item.producto,
      item.stock_total,
      item.costo_promedio,
      item.valor_total
    ]);

    doc.text('Reporte de Valoración de Inventario', 14, 15);
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 20
    });

    doc.save('reporte_valoracion_inventario.pdf');
  }

  // ➡️ Getter para la validación del objetivo
  get rotacionSuperaObjetivo(): boolean {
    if (this.rotacionData && this.rotacionData.rotacion_de_inventario != null) {
    return this.rotacionData.rotacion_de_inventario >= this.objetivoRotacion;
  }
  // Si rotacionData es nulo, devuelve false para evitar el error
  return false;
  }
}