// src/app/products/filters-sidebar/filters-sidebar.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para ngModel en checkboxes

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

// Interfaz para los filtros
export interface ProductFilters {
  stockStatus: {
    outOfStock: boolean; // Agotado
    minStock: boolean;   // Mínimo
    aboveMin: boolean;   // Arriba del mínimo
    noStockControl: boolean; // Sin control de stock
  };
  categories: string[]; // Lista de categorías seleccionadas
}

@Component({
  selector: 'app-filters-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './filters-sidebar.component.html',
  styleUrls: ['./filters-sidebar.component.scss']
})
export class FiltersSidebarComponent {
  @Output() filtersApplied = new EventEmitter<ProductFilters>();
  @Output() closeSidebar = new EventEmitter<void>();

  // Estado actual de los filtros
  currentFilters: ProductFilters = {
    stockStatus: {
      outOfStock: false,
      minStock: false,
      aboveMin: false,
      noStockControl: false,
    },
    categories: []
  };

  // Opciones de categorías disponibles (esto podría venir del backend)
  availableCategories: string[] = ['Lácteos', 'Carnes', 'Frutas', 'Verduras', 'Bebidas'];

  // Método para aplicar los filtros
  applyFilters(): void {
    this.filtersApplied.emit(this.currentFilters);
    this.closeSidebar.emit(); // Cierra el sidebar después de aplicar
  }

  // Método para limpiar todos los filtros
  clearFilters(): void {
    this.currentFilters = {
      stockStatus: {
        outOfStock: false,
        minStock: false,
        aboveMin: false,
        noStockControl: false,
      },
      categories: []
    };
    this.applyFilters(); // Aplica filtros vacíos
  }

  // Método para manejar la selección/deselección de categorías
  onCategoryChange(category: string, event: any): void {
    if (event.checked) {
      this.currentFilters.categories.push(category);
    } else {
      this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== category);
    }
  }
}