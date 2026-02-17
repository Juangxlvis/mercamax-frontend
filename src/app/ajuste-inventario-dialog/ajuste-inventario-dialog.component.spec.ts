import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjusteInventarioDialogComponent } from './ajuste-inventario-dialog.component';

describe('AjusteInventarioDialogComponent', () => {
  let component: AjusteInventarioDialogComponent;
  let fixture: ComponentFixture<AjusteInventarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjusteInventarioDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjusteInventarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});