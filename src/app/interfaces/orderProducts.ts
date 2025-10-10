export interface OrderProducts {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  isSubs:boolean;
  note?:string;
}
