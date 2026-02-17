// src/app/products/product-dialog/product-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Product } from '../../interfaces/producto';
import { ProductsService } from '../../services/products.service';

// Importaciones de Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError, MatFormField } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { CategoriaProducto } from '../../interfaces/categoria-producto';
import { Proveedor } from '../../interfaces/proveedor';
import { CategoriaDropdown } from '../../interfaces/categoria-dropdown';



@Component({
  selector: 'app-product-dialog',
  standalone: true,
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    // Módulos de Angular Material para el diálogo
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatError,
    MatSelectModule
  ],
})
export class ProductDialogComponent implements OnInit{

  categorias: CategoriaProducto[] = [];
  proveedores: Proveedor [] = [];

  constructor(
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private productsService: ProductsService) {}
    
  

  ngOnInit(): void {
    this.productsService.getCategories().subscribe(data => {
      this.categorias = data;
    });

    this.productsService.getProveedor().subscribe(data => {
    this.proveedores = data;
  });

  }

  // Dentro de tu clase ProductDialogComponent

onSave(): void {
    // 1. Creamos un objeto limpio que contiene solo los campos que la API espera.
    //    Esto evita enviar 'stock' o 'precio_compra'.
    const productDataToSend = {
      nombre: this.data.nombre,
      codigo_barras: this.data.codigo_barras,
      descripcion: this.data.descripcion,
      precio_venta: this.data.precio_venta,
      stock_minimo: this.data.stock_minimo,
      categoria: this.data.categoria, // El ngModel ya guarda el ID de la categoría
      proveedor: this.data.proveedor  // El ngModel ya guarda el ID del proveedor
    };

    // 2. Llamamos al servicio para que envíe los datos al backend.
    this.productsService.createProduct(productDataToSend).subscribe({
      next: (response) => {
        console.log('Producto creado exitosamente:', response);
        // 3. Cerramos el diálogo y devolvemos el nuevo producto que la API nos retornó.
        //    Esto permite que la tabla del dashboard se actualice.
        this.dialogRef.close(response); 
      },
      error: (err) => {
        console.error('Error al crear el producto:', err);
        // Aquí podrías mostrar un mensaje de error al usuario.
      }
    });
}

  onCancel(): void {
    this.dialogRef.close();
  }
}