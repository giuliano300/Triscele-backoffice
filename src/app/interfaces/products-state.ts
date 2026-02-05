export interface ProductsState {
  filters: {
    categoryId?: string;
    supplierId?: string;
    name?: string;
  };
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  show: boolean;
}
