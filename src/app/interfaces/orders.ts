import { OrderStatus, PaymentMethod } from '../enum/enum';
import { OrderProducts } from '../interfaces/orderProducts';

export interface Order {
  _id?: string; // opzionale, viene creato da MongoDB
  customerId: string;
  operatorId: string;
  status: OrderStatus;
  insertDate: string;
  paymentMethod: PaymentMethod;
  expectedDelivery: string;
  origin: string;
  agent: number;
  shippingAddress: string;
  shippingZipcode: string;
  shippingProvince: string;
  shippingCity: string;
  shippingName?: string;
  shippingLastName?: string;
  shippingBusinessName: string;
  shippingTelephone: string;
  shippingEmail: string;
  note?: string;
  orderProducts: OrderProducts[];
}
