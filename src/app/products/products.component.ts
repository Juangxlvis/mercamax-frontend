// src/app/products/products.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces y Servicios
import { Product } from '../interfaces/producto';
import { CategoriaProducto } from '../interfaces/categoria-producto';
import { ProductsService } from '../services/products.service';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { FiltersSidebarComponent } from './filters-sidebar/filters-sidebar.component';

// Importaciones de Angular Material
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductFilters } from './filters-sidebar/filters-sidebar.component';

import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  standalone: true,
  styleUrls: ['./products.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    FiltersSidebarComponent
  ]
})
export class ProductsComponent implements OnInit {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  // --- Propiedades para los Datos ---
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  allCategories: CategoriaProducto[] = [];
  categoryNames: string[] = [];

  // --- Propiedades para las Tarjetas de Resumen ---
  stockValue: number = 0;
  stockCost: number = 0;
  estimatedProfit: number = 0;
  totalProductsCount: number = 0;

  // --- Propiedades de Estado y UI ---
  searchText: string = '';
  isLoading: boolean = true;

  constructor(
    private productsService: ProductsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // 1. Cargar las categorías primero para poder usarlas en la tabla
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.categoryNames = categories.map(c => c.nombre);

        // 2. Una vez que tenemos las categorías, cargamos los productos
        this.productsService.getProducts().subscribe({
          next: (products) => {
            this.allProducts = products;
            this.filteredProducts = products;
            this.totalProductsCount = products.length;
            this.calculateSummaryMetrics(); // Calculamos los totales
            this.isLoading = false; // Terminamos de cargar
          },
          error: (err) => {
            console.error('Error al obtener los productos:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
        this.isLoading = false;
      }
    });
  }

  // Calcula los valores para las tarjetas de resumen
  calculateSummaryMetrics(): void {

    this.stockValue = 0;
    this.stockCost = 0;

    this.filteredProducts.forEach(product => {

      const stock = product.stock_total ?? 0;
      const precio = product.precio_venta ?? 0;
      const costo = product.costo_promedio_ponderado ?? 0;

      this.stockValue += stock * precio;
      this.stockCost += stock * costo;

    });

    this.estimatedProfit = this.stockValue - this.stockCost;
    this.totalProductsCount = this.filteredProducts.length;

  }


  // "Traduce" el ID de la categoría a su nombre para mostrarlo en la tabla
  getCategoryName(categoryId: number): string {
    const category = this.allCategories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin Categoría';
  }

  // Filtra la lista de productos basado en el texto de búsqueda
  filterProducts(): void {
    if (!this.searchText) {
      this.filteredProducts = this.allProducts;
    } else {
      const query = this.searchText.toLowerCase().trim();
      this.filteredProducts = this.allProducts.filter(product =>
        product.nombre.toLowerCase().includes(query) ||
        product.codigo_barras.includes(query)
      );
    }
    this.calculateSummaryMetrics();
  }

  // --- Métodos de Acciones del Usuario ---

  openCreateProductDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInitialData(); // Recargamos todos los datos para reflejar el cambio
      }
    });
  }

  viewProduct(productId?: number): void {
    if (productId) {
      console.log(`Navegando al detalle del producto con ID: ${productId}`);
      // Aquí iría la lógica para navegar a una nueva ruta, ej: this.router.navigate(['/products', productId]);
    }
  }

  // --- Editar un producto ---
  editProduct(product: Product, event: MouseEvent): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: { ...product } // <<-- pasamos el producto para edición
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Swal.fire({
          title: 'Producto actualizado',
          text: 'El producto fue actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#00bf63',
          confirmButtonText: 'Continuar'
        });
        this.loadInitialData();
      }
    });
  }

  // --- Eliminar un producto ---
deleteProduct(productId: number | undefined, event: MouseEvent): void {
  event.stopPropagation();

  if (!productId) return;

  Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción eliminará el producto del catálogo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {

    if (result.isConfirmed) {

      this.productsService.deleteProduct(productId).subscribe({
        next: () => {

          Swal.fire({
            title: 'Producto eliminado',
            text: 'El producto fue eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#00bf63',
            confirmButtonText: 'Continuar'
          });

          this.loadInitialData();
        },

        error: (err) => {
          let errorMessage = 'Hubo un problema al intentar eliminar el producto.';

          if (err.error && err.error.error) {
            errorMessage = err.error.error;
          }
          Swal.fire({
            title: 'Acción Denegada',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#00bf63',
            confirmButtonText: 'Entendido'
          });

        }
      });

    }

  });
}

  openFiltersSidebar(): void {
    this.sidenav.open();
  }

  exportProducts(): void {
    if (this.filteredProducts.length === 0) {
      Swal.fire('Advertencia', 'No hay productos para exportar.', 'warning');
      return;
    }

    // 1. Mapeamos los datos para crear objetos limpios (Las llaves serán los encabezados de Excel)
    const dataToExport = this.filteredProducts.map(product => ({
      'ID': product.id,
      'Nombre del Producto': product.nombre,
      'Código de Barras': product.codigo_barras,
      'Categoría': this.getCategoryName(product.categoria),
      'Precio de Venta ($)': product.precio_venta,
      'Costo Promedio ($)': product.costo_promedio_ponderado || 0,
      'Stock Total': product.stock_total || 0
    }));

    // 2. Convertimos el JSON a una Hoja de Trabajo de Excel (Worksheet)
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Toque Profesional: Ajustamos el ancho de las columnas automáticamente
    const columnWidths = [
      { wch: 10 }, // Ancho para ID
      { wch: 40 }, // Ancho para Nombre
      { wch: 20 }, // Ancho para Código
      { wch: 25 }, // Ancho para Categoría
      { wch: 18 }, // Ancho para Precio
      { wch: 18 }, // Ancho para Costo
      { wch: 15 }  // Ancho para Stock
    ];
    worksheet['!cols'] = columnWidths;

    // 4. Creamos el Libro de Trabajo (Workbook) y le añadimos nuestra hoja
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario MercaMax');

    // 5. Generamos y descargamos el archivo nativo .xlsx (¡Adiós a los problemas de tildes!)
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Reporte_Inventario_MercaMax_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  applyFilters(filters: ProductFilters): void {

    this.filteredProducts = this.allProducts.filter(product => {

      const stock = product.stock_total || 0;
      const minStock = product.stock_minimo || 0;

      let stockMatch = true;

      if (
        filters.stockStatus.outOfStock ||
        filters.stockStatus.minStock ||
        filters.stockStatus.aboveMin
      ) {

        stockMatch = false;

        if (filters.stockStatus.outOfStock && stock === 0) {
          stockMatch = true;
        }

        if (filters.stockStatus.minStock && stock > 0 && stock <= minStock) {
          stockMatch = true;
        }

        if (filters.stockStatus.aboveMin && stock > minStock) {
          stockMatch = true;
        }
      }

      let categoryMatch = true;

      if (filters.categories.length > 0) {

        const categoryName = this.getCategoryName(product.categoria);

        categoryMatch = filters.categories.includes(categoryName);
      }

      return stockMatch && categoryMatch;

    });

    this.calculateSummaryMetrics();

    this.sidenav.close();
  }
}
