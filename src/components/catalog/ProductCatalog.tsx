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

  // Extract unique category names
  const categories = useMemo(() => {
    const cats = new Set(
      initialProducts
        .map(p => p.categories?.name || p.category_id)
        .filter(Boolean)
    );
    return Array.from(cats);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const catName = product.categories?.name || product.category_id;
      const matchesCategory = selectedCategory ? catName === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, searchTerm, selectedCategory]);

  return (
    <section id="catalogo" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nuestro Catálogo</h2>
        
        {/* Buscador */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-gray-50 px-5 py-3 pr-10 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
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
