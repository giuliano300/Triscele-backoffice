import { OptionType } from "../enum/enum";
import { ProductUp } from "./productsUp";

export interface Options {
    _id: string;    
    name: string;  
    layer: string;
    optionType: OptionType; 
    products?: ProductUp[];
}