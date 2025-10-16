import { OrderStatus, PaymentMethod } from '../enum/enum';
import { OrderProducts } from '../interfaces/orderProducts';
import { Customers } from './customers';
import { Operators } from './operators';
import { OrderState } from './order-state';
import { OrderChangeState } from './orderChangeState';
import { Sectors } from './sectors';

export interface Order {
  _id?: string; 
  customerId: Customers;
  operatorId?: Operators;
  sectorId?: Sectors;
  status?: OrderState;
  insertDate: string;
  paymentMethod: PaymentMethod;
  expectedDelivery: string;
  origin: string;
  agentId: string;
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
  customerNote?: string;
  orderProducts: OrderProducts[];
  orderChangeState?: OrderChangeState[];
  totalPrice: number;
}
