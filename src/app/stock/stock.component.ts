import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StockItemService } from '../services/stock-item.service';
import { LoteService } from '../services/lote.service';
import { UbicacionService } from '../services/ubicacion.service';
import { StockItem } from '../interfaces/stock-item';
import { Lote } from '../interfaces/lote';
import { Ubicacion } from '../interfaces/ubicacion';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {

  stockItems: StockItem[] = [];
  lotes: Lote[] = [];
  ubicaciones: Ubicacion[] = [];

  stockForm: StockItem = this.emptyForm();
  isEditing = false;
  view = 'list';

  displayedColumns: string[] = [
    'id',
    'producto_nombre',
    'lote_info',
    'ubicacion_nombre',
    'cantidad',
    'acciones'
  ];

  constructor(
    private stockItemService: StockItemService,
    private loteService: LoteService,
    private ubicacionService: UbicacionService
  ) {}

  ngOnInit(): void {
    this.loadStock();
    this.loadLotes();
    this.loadUbicaciones();
  }

  private emptyForm(): StockItem {
    return { lote: 0, ubicacion: 0, cantidad: 0 };
  }

  loadStock(): void {
    this.stockItemService.getAll().subscribe({
      next: (data) => { this.stockItems = data; },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el stock.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  loadLotes(): void {
    this.loteService.getAll().subscribe({
      next: (data) => { this.lotes = data; },
      error: () => {}
    });
  }

  loadUbicaciones(): void {
    this.ubicacionService.getAll().subscribe({
      next: (data) => {
        // Solo estantes (no bodegas generales) para poder asignar stock
        this.ubicaciones = data.filter(u => u.tipo !== 'BODEGA');
      },
      error: () => {}
    });
  }

  newStock(): void {
    this.stockForm = this.emptyForm();
    this.isEditing = false;
    this.view = 'form';
  }

  editStock(item: StockItem): void {
    this.stockForm = { ...item };
    this.isEditing = true;
    this.view = 'form';
  }

  saveStock(): void {
    if (!this.stockForm.lote || !this.stockForm.ubicacion || this.stockForm.cantidad <= 0) {
      Swal.fire({
        title: 'Campos obligatorios',
        text: 'Debes seleccionar un lote, una ubicación e ingresar una cantidad mayor a 0.',
        icon: 'warning',
        confirmButtonColor: '#00bf63'
      });
      return;
    }

    const operation = this.isEditing && this.stockForm.id
      ? this.stockItemService.update(this.stockForm.id, this.stockForm)
      : this.stockItemService.create(this.stockForm);

    operation.subscribe({
      next: () => {
        Swal.fire({
          title: this.isEditing ? 'Stock actualizado' : 'Stock asignado',
          text: `El stock fue ${this.isEditing ? 'actualizado' : 'asignado'} correctamente.`,
          icon: 'success',
          confirmButtonColor: '#00bf63',
          confirmButtonText: 'Continuar'
        });
        this.loadStock();
        this.view = 'list';
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al guardar',
          text: err.message || 'No se pudo guardar el stock.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  deleteStock(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: '¿Retirar stock?',
      text: 'Se eliminará la asignación de este lote en esta ubicación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bf63',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockItemService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Stock retirado',
              text: 'La asignación fue eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#00bf63'
            });
            this.loadStock();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.message || 'No se pudo eliminar el stock.',
              icon: 'error',
              confirmButtonColor: '#00bf63'
            });
          }
        });
      }
    });
  }

  getLoteLabel(id: number): string {
    const lote = this.lotes.find(l => l.id === id);
    if (!lote) return `Lote #${id}`;
    const nombre = lote.producto_nombre || `Producto #${lote.producto}`;
    return `${nombre} — ${lote.codigo_lote}`;
  }

  getUbicacionNombre(id: number): string {
    const ubi = this.ubicaciones.find(u => u.id === id);
    return ubi ? ubi.nombre : `Ubicación #${id}`;
  }
}
