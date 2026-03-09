import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AjusteInventarioService } from '../services/ajuste-inventario.service';
import { UbicacionService } from '../services/ubicacion.service';
import { ProductsService } from '../services/products.service';
import { StockItemService } from '../services/stock-item.service';
import { LoteService } from '../services/lote.service';

import { Ubicacion } from '../interfaces/ubicacion';
import { Product } from '../interfaces/producto';
import { StockItem } from '../interfaces/stock-item';
import { Lote } from '../interfaces/lote';

import { AjusteInventarioDialogComponent } from '../ajuste-inventario-dialog/ajuste-inventario-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajuste-inventario',
  templateUrl: './ajuste-inventario.component.html',
  styleUrls: ['./ajuste-inventario.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule
  ]
})
export class AjusteInventarioComponent implements OnInit {

  ubicaciones: Ubicacion[] = [];
  productos: Product[] = [];
  lotes: Lote[] = [];
  stockItems: StockItem[] = [];
  filteredStockItems: StockItem[] = [];

  ubicacionSeleccionada: number | null = null;
  productoSeleccionado: number | null = null;

  displayedColumns: string[] = ['producto', 'lote', 'ubicacion', 'cantidad', 'acciones'];
  isLoading = false;

  constructor(
    private ubicacionService: UbicacionService,
    private productoService: ProductsService,
    private loteService: LoteService,
    private stockItemService: StockItemService,
    private ajusteService: AjusteInventarioService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.isLoading = true;

    this.ubicacionService.getAll().subscribe(data => this.ubicaciones = data);
    this.productoService.getProducts().subscribe(data => this.productos = data);

    // ✅ Fix: lotes ya se carga correctamente
    this.loteService.getAll().subscribe(data => this.lotes = data);

    this.stockItemService.getAll().subscribe({
      next: (data) => {
        this.stockItems = data;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el stock.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  aplicarFiltros(): void {
    this.filteredStockItems = this.stockItems.filter(item => {
      const ubicacionMatch = !this.ubicacionSeleccionada || item.ubicacion === this.ubicacionSeleccionada;
      const productoMatch = !this.productoSeleccionado || item.producto_nombre === this.getProductoNombre(this.productoSeleccionado);
      return ubicacionMatch && productoMatch;
    });
  }

  abrirFormularioAjuste(stockItem: StockItem): void {
    const lote = this.lotes.find(l => l.id === stockItem.lote);
    const ubicacion = this.ubicaciones.find(u => u.id === stockItem.ubicacion);

    const dialogRef = this.dialog.open(AjusteInventarioDialogComponent, {
      width: '480px',
      data: {
        stockItemId: stockItem.id,
        cantidadEnSistema: stockItem.cantidad,
        // ✅ Pasamos nombres legibles al dialog
        productoNombre: stockItem.producto_nombre || lote?.producto_nombre || 'N/A',
        loteCodigo: stockItem.lote_codigo || lote?.codigo_lote || 'N/A',
        ubicacionNombre: stockItem.ubicacion_nombre || ubicacion?.nombre || 'N/A'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.realizarAjuste(result);
      }
    });
  }

  realizarAjuste(ajusteData: any): void {
    this.ajusteService.realizarAjuste(ajusteData).subscribe({
      next: () => {
        Swal.fire({
          title: 'Ajuste realizado',
          text: 'El inventario fue ajustado correctamente.',
          icon: 'success',
          confirmButtonColor: '#00bf63',
          confirmButtonText: 'Continuar'
        });
        this.cargarDatosIniciales();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al ajustar',
          text: err.message || 'No se pudo realizar el ajuste.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  // Helpers para filtros
  getProductoNombre(id: number): string {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.nombre : '';
  }

  // Helpers para la tabla (fallback si el backend no trae los campos de solo lectura)
  getLoteInfo(stockItem: StockItem): string {
    if (stockItem.lote_codigo) return stockItem.lote_codigo;
    const lote = this.lotes.find(l => l.id === stockItem.lote);
    return lote?.codigo_lote || 'N/A';
  }

  getProductoInfo(stockItem: StockItem): string {
    if (stockItem.producto_nombre) return stockItem.producto_nombre;
    const lote = this.lotes.find(l => l.id === stockItem.lote);
    if (!lote) return 'N/A';
    const producto = this.productos.find(p => p.id === lote.producto);
    return producto?.nombre || 'N/A';
  }

  getUbicacionInfo(stockItem: StockItem): string {
    if (stockItem.ubicacion_nombre) return stockItem.ubicacion_nombre;
    const ubi = this.ubicaciones.find(u => u.id === stockItem.ubicacion);
    return ubi?.nombre || 'N/A';
  }
}
