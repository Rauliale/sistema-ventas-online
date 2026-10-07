'use client';
import React, { useState, useEffect } from 'react';
import { Product } from '../../lib/api/products';
import { ChevronLeft, ChevronRight, Tag, PackagePlus } from 'lucide-react';
import Link from 'next/link';

interface PromoCarouselProps {
  promos: Product[];
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ promos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promos.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? promos.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % promos.length);
  };

  if (!promos || promos.length === 0) {
    return (
      <section className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-8 py-16 text-surface shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Construye con <span className="text-secondary">Confianza</span>
          </h1>
          <p className="mb-8 text-lg text-blue-100 md:text-xl">
            Encontrá las mejores herramientas manuales, eléctricas y accesorios.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="relative mb-12 h-[350px] w-full overflow-hidden rounded-2xl bg-gray-900 shadow-xl group">
      {/* Container de los slides */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {promos.map((promo, idx) => {
          const isCombo = promo.is_combo;
          const hasDiscount = promo.compare_at_price && promo.compare_at_price > promo.price;
          const discountPercentage = hasDiscount 
            ? Math.round((1 - (promo.price / promo.compare_at_price!)) * 100) 
            : 0;

          return (
            <div key={promo.id} className="relative w-full flex-shrink-0 h-full">
              {/* Imagen de fondo (blur) */}
              <div className="absolute inset-0 opacity-30">
                {promo.images && promo.images.length > 0 ? (
                  <img src={promo.images[0]} alt="" className="w-full h-full object-cover blur-xl scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary to-blue-900"></div>
                )}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>

              {/* Contenido Principal */}
              <div className="relative h-full flex items-center justify-center container mx-auto px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                  
                  {/* Textos */}
                  <div className="text-white order-2 md:order-1 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCombo ? 'bg-secondary text-gray-900' : 'bg-danger text-white'}`}>
                        {isCombo ? <PackagePlus className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        {isCombo ? 'Combo Especial' : `¡${discountPercentage}% OFF!`}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg line-clamp-2">
                      {promo.title}
                    </h2>
                    
                    <p className="text-gray-300 text-lg mb-6 line-clamp-2 hidden md:block">
                      {promo.description || 'Aprovechá esta oportunidad por tiempo limitado.'}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-black text-secondary drop-shadow-md">
                        ${promo.price.toLocaleString('es-AR')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xl text-gray-400 line-through font-medium">
                          ${promo.compare_at_price!.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Imagen del producto */}
                  <div className="order-1 md:order-2 flex justify-center items-center h-48 md:h-72">
                    {promo.images && promo.images.length > 0 ? (
                      <img 
                        src={promo.images[0]} 
                        alt={promo.title} 
                        className="max-h-full max-w-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-lg" 
                      />
                    ) : (
                      <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Tag className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones de navegación (visibles al hacer hover en pantallas grandes) */}
      {promos.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores (Puntitos) */}
          <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2">
            {promos.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-secondary w-6' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
