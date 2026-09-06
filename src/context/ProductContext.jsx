import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.warn('Failed to load products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = (productData) => {
    const newProduct = { id: `PROD-${Date.now()}`, ...productData };
    setProducts(prev => [...(Array.isArray(prev) ? prev : []), newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    let updated;
    setProducts(prev => (Array.isArray(prev) ? prev : []).map(p => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    }));
    return updated;
  };

  const deleteProductItem = (id) => {
    setProducts(prev => (Array.isArray(prev) ? prev : []).filter(p => p.id !== id));
  };

  const productsList = Array.isArray(products) ? products : [];

  return (
    <ProductContext.Provider value={{ products: productsList, isLoading, error, addProduct, updateProduct, deleteProduct: deleteProductItem, reloadProducts: loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
