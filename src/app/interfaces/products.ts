import { ProductOptions } from "./productOptions";
import { SubProducts } from "./subProducts";

export interface Product {
  _id?: string; 
  name: string;
  categoryId: string;
  theshold: number;
  price: number;
  cost: number;
  stock: number;
  enabled: boolean;
  stock_type: string;
  supplierCode: string;
  supplierId: string;
  description?: string;
  files?: any[];
  subProducts?: SubProducts[];
  options: ProductOptions[];
  purchasePackage?: string;
  isNew?: boolean;
}
