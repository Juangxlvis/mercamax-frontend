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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { UbicacionService } from '../services/ubicacion.service';
import { CategoriaubicacionService } from '../services/categoriaubicacion.service';
import { Ubicacion } from '../interfaces/ubicacion';
import { CategoriaUbicacion } from '../interfaces/categoria-ubicacion';

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
    MatSelectModule,
    MatSnackBarModule
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
  displayedColumns: string[] = ['id', 'nombre', 'tipo', 'categoria_nombre', 'parent_nombre', 'capacidad_maxima', 'acciones'];

  constructor(
    private ubicacionService: UbicacionService,
    private categoriaService: CategoriaubicacionService,
    private snackBar: MatSnackBar
  ) { }

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
      error: (err) => {
        this.snackBar.open(`Error al cargar ubicaciones: ${err.message}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        this.snackBar.open(`Error al cargar categorías: ${err.message}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadTiposUbicacion(): void {
    this.ubicacionService.getTipos().subscribe({
      next: (data) => {
        this.tiposUbicacion = data;
      },
      error: (err) => {
        this.snackBar.open(`Error al cargar tipos de ubicación: ${err.message}`, 'Cerrar', { duration: 3000 });
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
      this.snackBar.open('El nombre y el tipo son obligatorios.', 'Cerrar', { duration: 3000 });
      return;
    }

    const operation = this.isEditing && this.ubicacionForm.id
      ? this.ubicacionService.update(this.ubicacionForm.id, this.ubicacionForm)
      : this.ubicacionService.create(this.ubicacionForm);

    operation.subscribe({
      next: () => {
        this.snackBar.open(`Ubicación ${this.isEditing ? 'actualizada' : 'creada'} con éxito.`, 'Cerrar', { duration: 3000 });
        this.loadUbicaciones();
        this.view = 'list';
      },
      error: (err) => {
        this.snackBar.open(`Error: ${err.message}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteUbicacion(id: number | undefined): void {
    if (id && confirm('¿Estás seguro de eliminar esta ubicación?')) {
      this.ubicacionService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Ubicación eliminada con éxito.', 'Cerrar', { duration: 3000 });
          this.loadUbicaciones();
        },
        error: (err) => {
          this.snackBar.open(`Error al eliminar: ${err.message}`, 'Cerrar', { duration: 3000 });
        }
      });
    }
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