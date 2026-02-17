import { TestBed } from '@angular/core/testing';

import { AjusteInventarioService } from '././ajuste-inventario.service';

describe('AjusteInventarioService', () => {
  let service: AjusteInventarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AjusteInventarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});