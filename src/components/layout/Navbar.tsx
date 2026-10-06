'use client';
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const Navbar: React.FC = () => {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalAmount = useCartStore((state) => state.getTotal());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-surface shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Ferretería Online</span>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <a href="#" className="text-sm font-medium text-text-main hover:text-primary">Inicio</a>
          <a href="#" className="text-sm font-medium text-text-main hover:text-primary">Categorías</a>
          <a href="#" className="text-sm font-medium text-text-main hover:text-primary">Ofertas</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {totalItems > 0 && (
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-medium text-text-muted">Mi Carrito</span>
                <span className="text-sm font-bold text-text-main">${totalAmount.toLocaleString('es-AR')}</span>
              </div>
            )}
            <button
              onClick={toggleCart}
              className="relative rounded-full bg-gray-100 p-2 text-text-main hover:bg-gray-200 focus:outline-none transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-surface shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
