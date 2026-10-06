'use client';
import React from 'react';
import { Product } from '../../lib/api/products';
import { useCartStore } from '../../store/useCartStore';

import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Agregado al carrito');
  };

  const handleWhatsAppConsult = () => {
    const message = `Hola, tengo una duda sobre ${product.title} (SKU: ${product.sku})`;
    const url = `https://wa.me/5493755221332?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
      {/* Etiqueta de Oferta */}
      {product.compare_at_price && product.compare_at_price > product.price && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-danger px-3 py-1 text-xs font-bold text-white shadow-sm">
          OFERTA
        </div>
      )}

      <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-400 mb-2 uppercase">{product.sku}</p>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3 leading-snug group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="mb-5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm font-medium text-gray-400 line-through">
                ${product.compare_at_price.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleAddToCart} 
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all"
          >
            Agregar al carrito
          </button>
          <button 
            onClick={handleWhatsAppConsult} 
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
