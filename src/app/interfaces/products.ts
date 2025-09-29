export interface Product {
  _id?: string; 
  name: string;
  internalCode: string;
  categoryId: string;
  theshold: number;
  price: number;
  cost: number;
  enabled: boolean;
  stock_type: string;
  supplierCode: string;
  supplierId: string;
  description?: string;
  files?: any[];
  amazonCode?: string;
  ebayCode?: string;
  wcCode?: string;
  manomanoCode?: string;
}
