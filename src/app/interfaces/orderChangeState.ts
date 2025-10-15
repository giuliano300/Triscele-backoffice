import { OrderStatus } from "../enum/enum";

export interface OrderChangeState {
  orderState: OrderStatus;  
  orderId: string;
  name: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: Date;
  operatorId: string;
  operatorName: string;
}