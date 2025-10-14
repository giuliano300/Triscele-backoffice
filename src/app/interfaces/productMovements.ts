export interface ProductMovements {
    _id: string;    
    movementType: number;
    stock: number;
    supplierId?: string;
    supplierName?: string;
    supplierCode?: string;
    productId: string;
    createdAt: string;
}