import { Categories } from "../interfaces/categories";
import { ProductMovements } from "../interfaces/productMovements";
import { SubProducts } from "../interfaces/subProducts";
import { Supplier } from "../interfaces/suppliers";

export class ProductViewModel {
    id: string | undefined;
    name: string | undefined;
    price: number| undefined;
    cost: number| undefined;
    theshold: number| undefined;
    enabled: boolean| undefined;
    stock_type: string| undefined;
    stock: number| undefined;
    supplierCode: string| undefined;
    description?: string| undefined;

    categoryId?: number | undefined;
    supplierId?: number | undefined;

    purchasePackage?:  string| undefined;

    files: any[] = [];

    category: Categories | undefined;

    supplier: Supplier | undefined;

    productMovements: ProductMovements[] = [];
    
    subProducts: SubProducts[] = [];
}
