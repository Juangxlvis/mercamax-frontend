export interface ProductFilters {
    stockStatus: {
    outOfStock: boolean;
    minStock: boolean;
    aboveMin: boolean;
    noStockControl: boolean;
  };
  categories: string[];
}