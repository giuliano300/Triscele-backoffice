import { ProductUp } from "./productsUp";

export interface ProductsOptions {
    _id: string;    
    name: string;
    products?: ProductUp[];
}