import { ProductViewModel } from "../classess/productViewModel";
import { Product } from "../interfaces/products";

export function mapToProduct(vm: ProductViewModel): Product {
  return {
    _id: vm.id,
    name: vm.name ?? '',
    categoryId: vm.categoryId?.toString() ?? '',
    theshold: vm.theshold ?? 0,
    price: vm.price ?? 0,
    cost: vm.cost ?? 0,
    stock: vm.stock ?? 0,
    enabled: vm.enabled ?? false,
    stock_type: vm.stock_type ?? 'manual',
    supplierCode: vm.supplierCode ?? '',
    supplierId: vm.supplierId?.toString() ?? '',
    description: vm.description,
    files: vm.files ?? [],
    subProducts: vm.subProducts ?? [],
    options: vm.options ?? [],
    purchasePackage: vm.purchasePackage
  };
}