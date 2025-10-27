import { OptionRow } from "./optionRow";
import { ProductsOptions } from "./productsOptions";

export interface ProductOptions {
   _id: string;
  position: number;
  option: ProductsOptions;
  parentId?: string;
  parentProductId?: string;
}
