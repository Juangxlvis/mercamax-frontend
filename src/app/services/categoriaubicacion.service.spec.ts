import { TestBed } from '@angular/core/testing';

import { CategoriaubicacionService } from './categoriaubicacion.service';

describe('CategoriaubicacionService', () => {
  let service: CategoriaubicacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriaubicacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});