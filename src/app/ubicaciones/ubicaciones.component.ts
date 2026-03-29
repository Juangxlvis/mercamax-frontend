// ubicaciones.component.ts
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
import { UbicacionService } from '../services/ubicacion.service';
import { CategoriaubicacionService } from '../services/categoriaubicacion.service';
import { Ubicacion } from '../interfaces/ubicacion';
import { CategoriaUbicacion } from '../interfaces/categoria-ubicacion';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-ubicaciones',
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
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.scss']
})
export class UbicacionesComponent implements OnInit {

  ubicaciones: Ubicacion[] = [];
  categorias: CategoriaUbicacion[] = [];
  tiposUbicacion: { value: string, label: string }[] = [];

  ubicacionForm: Ubicacion = {
    nombre: '',
    tipo: 'BODEGA',
    categoria: null,
    parent: null,
    capacidad_maxima: null
  };

  isEditing = false;
  view = 'list';

  displayedColumns: string[] = [
    'id',
    'nombre',
    'tipo',
    'categoria_nombre',
    'parent_nombre',
    'capacidad_maxima',
    'acciones'
  ];

  constructor(
    private ubicacionService: UbicacionService,
    private categoriaService: CategoriaubicacionService
  ) {}

  ngOnInit(): void {
    this.loadUbicaciones();
    this.loadCategorias();
    this.loadTiposUbicacion();
  }

  loadUbicaciones(): void {
    this.ubicacionService.getAll().subscribe({
      next: (data) => {
        this.ubicaciones = data;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las ubicaciones.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las categorías.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  loadTiposUbicacion(): void {
    this.ubicacionService.getTipos().subscribe({
      next: (data) => {
        this.tiposUbicacion = data;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los tipos de ubicación.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });
      }
    });
  }

  newUbicacion(): void {
    this.ubicacionForm = {
      nombre: '',
      tipo: 'BODEGA',
      categoria: null,
      parent: null,
      capacidad_maxima: null
    };

    this.isEditing = false;
    this.view = 'form';
  }

  editUbicacion(ubicacion: Ubicacion): void {
    this.ubicacionForm = { ...ubicacion };
    this.isEditing = true;
    this.view = 'form';
  }

  saveUbicacion(): void {

    if (!this.ubicacionForm.nombre || !this.ubicacionForm.tipo) {

      Swal.fire({
        title: 'Campos obligatorios',
        text: 'El nombre y el tipo son obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#00bf63'
      });

      return;
    }

    const operation = this.isEditing && this.ubicacionForm.id
      ? this.ubicacionService.update(this.ubicacionForm.id, this.ubicacionForm)
      : this.ubicacionService.create(this.ubicacionForm);

    operation.subscribe({

      next: () => {

        Swal.fire({
          title: this.isEditing ? 'Ubicación actualizada' : 'Ubicación creada',
          text: `La ubicación fue ${this.isEditing ? 'actualizada' : 'creada'} correctamente.`,
          icon: 'success',
          confirmButtonColor: '#00bf63',
          confirmButtonText: 'Continuar'
        });

        this.loadUbicaciones();
        this.view = 'list';
      },

      error: () => {

        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la ubicación.',
          icon: 'error',
          confirmButtonColor: '#00bf63'
        });

      }

    });

  }

  deleteUbicacion(id: number | undefined): void {

    if (!id) return;

    Swal.fire({
      title: '¿Eliminar ubicación?',
      text: 'Esta acción eliminará la ubicación del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        this.ubicacionService.delete(id).subscribe({

          next: () => {

            Swal.fire({
              title: 'Ubicación eliminada',
              text: 'La ubicación fue eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#00bf63',
              confirmButtonText: 'Continuar'
            });

            this.loadUbicaciones();
          },

          error: (err) => {
            let errorMessage = 'Hubo un problema al intentar eliminar la Ubicación.';

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

  getCategoriaNombre(id: number | null): string {
    if (!id) return 'Ninguna';

    const categoria = this.categorias.find(cat => cat.id === id);

    return categoria ? categoria.nombre : 'Desconocida';
  }

  getParentNombre(id: number | null): string {

    if (!id) return 'Ninguna';

    const parent = this.ubicaciones.find(u => u.id === id);

    return parent ? parent.nombre : 'Desconocida';
  }

  getUbicacionesPadre(): Ubicacion[] {
    return this.ubicaciones.filter(u => u.tipo === 'BODEGA');
  }

  getTipoLabel(tipo: string): string {

    const tipoUbicacion = this.tiposUbicacion.find(t => t.value === tipo);

    return tipoUbicacion ? tipoUbicacion.label : tipo;
  }

}
