'use client';
import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../ui/Button';

import { usePathname } from 'next/navigation';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotal } = useCartStore();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={toggleCart}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-xl transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-text-main">Tu Carrito</h2>
          <button onClick={toggleCart} className="p-2 text-text-muted hover:text-text-main">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCart className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-text-muted">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.product.id} className="flex gap-4 border-b border-gray-100 pb-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-text-main line-clamp-2">{item.product.title}</h3>
                      <button onClick={() => removeItem(item.product.id)} className="text-text-muted hover:text-danger ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-bold text-text-main">${item.product.price.toLocaleString('es-AR')}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-gray-200">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-gray-50">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-gray-50">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-text-main mb-4">
              <p>Subtotal</p>
              <p>${getTotal().toLocaleString('es-AR')}</p>
            </div>
            <p className="text-xs text-text-muted mb-4">
              El costo final de envío se coordina tras finalizar la orden según tu zona y peso del paquete.
            </p>
            <a href="/checkout" onClick={toggleCart} className="w-full block">
              <Button variant="primary" className="w-full">
                Continuar con la compra
              </Button>
            </a>
          </div>
        )}
      </div>
    </>
  );
};

// Extracted from above to avoid compilation errors due to missing import in the same file if I just use it
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
