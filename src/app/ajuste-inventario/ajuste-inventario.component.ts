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
import { Ubicacion } from '../interfaces/ubicacion';
import { Product } from '../interfaces/producto';
import { StockItem } from '../interfaces/stock-item';

// ➡️ Importar el componente modal que se creará a continuación
import { AjusteInventarioDialogComponent } from '../ajuste-inventario-dialog/ajuste-inventario-dialog.component';
import { Lote } from '../interfaces/lote';
import { LoteService } from '../services/lote.service';
import { StockItemService } from '../services/stock-item.service';

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
  lotes: Lote[] = []; // Se necesitan para mapear producto y lote
  stockItems: StockItem[] = []; // La data completa del back
  filteredStockItems: StockItem[] = []; // La data filtrada para la tabla

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
  ) { }

  ngOnInit(): void {
    // ➡️ Cargar todas las listas al iniciar
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.isLoading = true;
    this.ubicacionService.getAll().subscribe(data => this.ubicaciones = data);
    this.productoService.getProducts().subscribe(data => this.productos = data);
    //this.loteService.getAll().subscribe(data => this.lotes = data);

    // Cargar todos los StockItems y luego aplicar filtros
    this.stockItemService.getAll().subscribe(data => {
      this.stockItems = data;
      this.aplicarFiltros(); // Aplica filtros iniciales (sin selección)
      this.isLoading = false;
    });
  }

  aplicarFiltros(): void {
    this.filteredStockItems = this.stockItems.filter(item => {
      // ➡️ Lógica para verificar la Ubicación
      const ubicacionMatch = !this.ubicacionSeleccionada || item.ubicacion === this.ubicacionSeleccionada;

      // ➡️ Lógica para verificar el Producto
      const lote = this.lotes.find(l => l.id === item.lote);
      const productoMatch = !this.productoSeleccionado || (lote && lote.producto === this.productoSeleccionado);
      
      return ubicacionMatch && productoMatch;
    });
  }

  abrirFormularioAjuste(stockItem: StockItem): void {
    const dialogRef = this.dialog.open(AjusteInventarioDialogComponent, {
      width: '400px',
      data: {
        stockItemId: stockItem.id,
        cantidadEnSistema: stockItem.cantidad
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.realizarAjuste(result);
      }
    });
  }

  realizarAjuste(ajusteData: any): void {
    this.ajusteService.realizarAjuste(ajusteData).subscribe(
      response => {
        console.log('Ajuste exitoso:', response);
        alert('Ajuste de inventario realizado con éxito.');
        this.cargarDatosIniciales(); // Recargar los datos para ver los cambios
      },
      error => {
        console.error('Error al realizar el ajuste:', error);
        alert('Error al realizar el ajuste. Por favor, intente de nuevo.');
      }
    );
  }

  // ➡️ Métodos auxiliares para la visualización en la tabla
  getLote(loteId: number): Lote | undefined {
    return this.lotes.find(l => l.id === loteId);
  }

  
  getProducto(productoId: number | undefined): Product | undefined {
    if (productoId !== undefined) {
        return this.productos.find(p => p.id === productoId);
    }
    return undefined;
}
  getUbicacion(ubicacionId: number): Ubicacion | undefined {
    return this.ubicaciones.find(u => u.id === ubicacionId);
  }
}