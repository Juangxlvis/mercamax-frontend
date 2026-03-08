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

  // Dentro de clase ProductDialogComponent

onSave(): void {

  if (this.data.id) {

    // EDITAR PRODUCTO
    this.productsService.updateProduct(this.data.id, this.data)
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
        }
      });

  } else {

    // CREAR PRODUCTO
    this.productsService.createProduct(this.data)
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al crear producto', err);
        }
      });

  }
}

  onCancel(): void {
    this.dialogRef.close();
  }
}