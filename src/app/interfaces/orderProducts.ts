import { ProductOptions } from "./productOptions";

export interface OrderProducts {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  discountPercentage: number;
  total: number;
  isSubs:boolean;
  note?:string;
  parentId?:string;
  options?: ProductOptions[];
  
}
