'use client';
import React, { useState, useMemo } from 'react';
import { Product } from '../../lib/api/products';
import { ProductCard } from '../ui/ProductCard';

interface ProductCatalogProps {
  initialProducts: Product[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories directly from products for the MVP
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category_id));
    return Array.from(cats);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, searchTerm, selectedCategory]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-text-main">Catálogo de Productos</h2>
        
        {/* Buscador */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filtros por Categoría */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-1 text-sm transition-colors ${!selectedCategory ? 'bg-primary text-surface' : 'bg-gray-100 text-text-main hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1 text-sm transition-colors ${selectedCategory === cat ? 'bg-primary text-surface' : 'bg-gray-100 text-text-main hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      
      {/* Grilla de productos */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center text-text-muted">
          No se encontraron productos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
