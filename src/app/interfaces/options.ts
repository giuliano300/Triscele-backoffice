import { ProductUp } from "./productsUp";

export interface Options {
    _id: string;    
    name: string;
    products?: ProductUp[];
}