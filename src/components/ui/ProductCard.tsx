'use client';
import React from 'react';
import { Product } from '../../lib/api/products';
import { Button } from './Button';
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
    <div className="flex flex-col rounded-lg border border-gray-200 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-4">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs text-text-muted mb-1">SKU: {product.sku}</p>
          <h3 className="text-sm font-medium text-text-main line-clamp-2 mb-2">
            {product.title}
          </h3>
          <div className="mb-4">
            <span className="text-lg font-bold text-text-main">
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.compare_at_price && (
              <span className="ml-2 text-sm text-text-muted line-through">
                ${product.compare_at_price.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleAddToCart} variant="primary" className="w-full">
            Agregar al carrito
          </Button>
          <Button onClick={handleWhatsAppConsult} variant="secondary" className="w-full">
            Consultar por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};
