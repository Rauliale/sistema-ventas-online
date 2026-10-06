'use client';
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const Navbar: React.FC = () => {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const totalItems = useCartStore((state) => state.getTotalItems());

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
          <button
            onClick={toggleCart}
            className="relative p-2 text-text-main hover:text-primary focus:outline-none"
            aria-label="Carrito de compras"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-surface">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
