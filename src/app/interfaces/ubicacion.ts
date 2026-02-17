import { CategoriaUbicacion } from "./categoria-ubicacion";

export interface Ubicacion {
  id?: number;
  nombre: string;
  tipo: string;
  categoria: number | null;
  parent: number | null;
  capacidad_maxima?: number | null;
  categoria_nombre?:  string;
  parent_nombre?: string;
}