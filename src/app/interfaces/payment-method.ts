export interface PaymentMethodOption {
  _id?: string;
  name: string;
  enabled: boolean;
  position: number;
  action?: {
    edit: string;
  };
}
