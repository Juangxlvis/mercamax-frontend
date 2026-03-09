import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  stockItemId: number;
  cantidadEnSistema: number;
  productoNombre: string;
  loteCodigo: string;
  ubicacionNombre: string;
}

@Component({
  selector: 'app-ajuste-inventario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ajuste-inventario-dialog.component.html',
  styleUrl: './ajuste-inventario-dialog.component.scss'
})
export class AjusteInventarioDialogComponent implements OnInit {

  cantidadContada: number = 0;
  motivoSeleccionado: string = '';
  notas: string = '';

  motivos = [
    { value: 'CONTEO', label: 'Diferencia por Conteo Físico' },
    { value: 'DAÑADO', label: 'Producto Dañado / Merma' },
    { value: 'ROBO',   label: 'Robo o Extravío' },
    { value: 'RECEPCION', label: 'Error en Recepción' },
    { value: 'OTRO',   label: 'Otro' }
  ];

  get diferencia(): number {
    return this.cantidadContada - this.data.cantidadEnSistema;
  }

  get diferenciaLabel(): string {
    if (this.diferencia > 0) return `+${this.diferencia} (sobrante)`;
    if (this.diferencia < 0) return `${this.diferencia} (faltante)`;
    return '0 (sin cambio)';
  }

  get diferenciaColor(): string {
    if (this.diferencia > 0) return '#38a169';
    if (this.diferencia < 0) return '#e53e3e';
    return '#718096';
  }

  constructor(
    public dialogRef: MatDialogRef<AjusteInventarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.cantidadContada = this.data.cantidadEnSistema;
  }

  confirmar(): void {
    if (!this.motivoSeleccionado) return;

    this.dialogRef.close({
      stock_item_id: this.data.stockItemId,
      cantidad_contada: this.cantidadContada,
      motivo: this.motivoSeleccionado,
      notas: this.notas
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
