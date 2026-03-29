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
import { LoteService } from '../services/lote.service';
import { ProductsService } from '../services/products.service';
import { Lote } from '../interfaces/lote';
import { Product } from '../interfaces/producto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lotes',
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
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.scss']
})
export class LotesComponent implements OnInit {

  lotes: Lote[] = [];
  productos: Product[] = [];

  loteForm: Lote = this.emptyForm();

  isEditing = false;
  view = 'list';

  displayedColumns: string[] = [
    'id',
    'producto_nombre',
    'codigo_lote',
    'fecha_recepcion',
    'fecha_caducidad',
    'costo_unitario',
    'cantidad_inicial',
    'cantidad_sin_ubicar',
    'acciones'
  ];

  constructor(
    private loteService: LoteService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadLotes();
    this.loadProductos();
  }

  private emptyForm(): Lote {
    return {
      producto: 0,
      codigo_lote: '',
      fecha_caducidad: '',
      costo_unitario: 0,
      cantidad_inicial: 0
    };
  }

  loadLotes(): void {
    this.loteService.getAll().subscribe({
      next: (data) => {
        this.lotes = data;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los lotes.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  loadProductos(): void {
    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los productos.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  newLote(): void {
    this.loteForm = this.emptyForm();
    this.isEditing = false;
    this.view = 'form';
  }

  editLote(lote: Lote): void {
    this.loteForm = { ...lote };
    this.isEditing = true;
    this.view = 'form';
  }

  saveLote(): void {
    if (!this.loteForm.producto || !this.loteForm.codigo_lote || !this.loteForm.fecha_caducidad) {
      Swal.fire({
        title: 'Campos obligatorios',
        text: 'Producto, código de lote y fecha de caducidad son obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#00bf63'
      });
      return;
    }

    const operation = this.isEditing && this.loteForm.id
      ? this.loteService.update(this.loteForm.id, this.loteForm)
      : this.loteService.create(this.loteForm);

    operation.subscribe({
      next: () => {
        Swal.fire({
          title: this.isEditing ? 'Lote actualizado' : 'Lote creado',
          text: `El lote fue ${this.isEditing ? 'actualizado' : 'creado'} correctamente.`,
          icon: 'success',
          confirmButtonColor: '#00bf63',
          confirmButtonText: 'Continuar'
        });
        this.loadLotes();
        this.view = 'list';
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo guardar el lote.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  deleteLote(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: '¿Eliminar lote?',
      text: 'Esta acción eliminará el lote del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loteService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Lote eliminado',
              text: 'El lote fue eliminado correctamente.',
              icon: 'success',
              confirmButtonColor: '#00bf63',
              confirmButtonText: 'Continuar'
            });
            this.loadLotes();
          },
          error: (err) => {

            let errorMessage = 'Hubo un problema al intentar eliminar el lote, ya que tiene stock asignado.';

            if (err.error && err.error.error) {
              errorMessage = err.error.error;
            }
            Swal.fire({
              title: 'Acción Denegada',
              text: errorMessage,
              icon: 'error',
              confirmButtonColor: '#d33',
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
  }

  getProductoNombre(id: number): string {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.nombre : 'Desconocido';
  }
}
