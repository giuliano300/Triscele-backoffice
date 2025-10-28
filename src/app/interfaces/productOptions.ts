import { Options } from "./options";
import { ProductUp } from "./productsUp";

export interface ProductOptions {
   _id: string;
  position: number;
  option: Options;
  parent?: Options;
  parentProduct?: ProductUp;
}
