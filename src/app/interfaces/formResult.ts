import { ProductUp } from "./productsUp";

export interface FormResult {
  optionId: string;
  selectedProduct?: ProductUp | null;
  children?: FormResult[];
}