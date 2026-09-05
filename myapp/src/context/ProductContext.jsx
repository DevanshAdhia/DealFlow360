import React, { createContext, useContext, useState, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => dataService.getProducts());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(() => {
    try {
      const data = dataService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    }
  }, []);

  const addProduct = (productData) => {
    const newProduct = { id: `PROD-${Date.now()}`, ...productData };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    let updated;
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    }));
    return updated;
  };

  const deleteProductItem = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, isLoading, error, addProduct, updateProduct, deleteProduct: deleteProductItem, reloadProducts: loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
