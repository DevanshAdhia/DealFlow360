import { MOCK_PRODUCTS } from '../data/products.js';
import { fetchResource, fetchResourceById } from './api.js';

export const getAllProductsSync = () => MOCK_PRODUCTS;

export const getProductByIdSync = (id) => {
  if (!id) return MOCK_PRODUCTS[0];
  const clean = String(id).toLowerCase().trim();
  const found = MOCK_PRODUCTS.find(
    p => (p.id && String(p.id).toLowerCase() === clean) ||
         (p.productCode && String(p.productCode).toLowerCase() === clean) ||
         (p.sku && String(p.sku).toLowerCase() === clean)
  );
  if (found) return found;

  return {
    id,
    productCode: id.startsWith('SKU-') ? id : `SKU-${id}`,
    name: 'Dell PowerEdge R750 Enterprise Server',
    description: 'Dual-socket 2U rack server powering high-performance compute and enterprise workloads.',
    unitPrice: 2800000,
    listPrice: 2800000,
    costPrice: 1680000,
    categoryName: 'Hardware & Servers',
    categoryCode: 'HW',
    sku: id,
    stock: 45,
    quantityOnHand: 45,
    availableQuantity: 40,
    status: 'ACTIVE',
    gstRate: 18,
    isSubscription: false,
    variants: []
  };
};

export const getAllProducts = () => MOCK_PRODUCTS;

export const getProductById = (productId) => getProductByIdSync(productId);

export const getProductCategories = async () => await fetchResource('categories');
export const getProductPriceLists = async () => [];
