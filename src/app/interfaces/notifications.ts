export interface Notifications {
  _id: string;    
  userId?: string | null;
  userRole: 'admin' | 'operator' | 'customer';
  event: string;
  payload: any;
  read: boolean;
  createdAt?: string; 
  updatedAt?: string;
}
