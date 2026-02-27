export interface ConfigProductToOrder {
    _id: string;    
    name: string;
    selectedProduct?: any;
    selectedProducts?: any[]; 
    children?: [];
    value: any;
}