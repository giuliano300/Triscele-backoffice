import { Categories } from "../interfaces/categories";
import { Supplier } from "../interfaces/suppliers";

export class ProductViewModel {
    id: string | undefined;
    name: string | undefined;
    internalCode: string | undefined;
    price: number| undefined;
    cost: number| undefined;
    theshold: number| undefined;
    enabled: boolean| undefined;
    stock_type: string| undefined;
    supplierCode: string| undefined;
    description?: string| undefined;

    categoryId?: number | undefined;
    supplierId?: number | undefined;

    amazonCode:  string| undefined;
    ebayCode:  string| undefined;
    wcCode:  string| undefined;
    manomanoCode:  string| undefined;

    files: any[] = [];

    category: Categories | undefined;

    supplier: Supplier | undefined;
}
