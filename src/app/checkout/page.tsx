'use client';
import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';

export default function CheckoutPage() {
  const { items, getTotal, getTotalItems } = useCartStore();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer'>('mercadopago');

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text-main">Tu carrito está vacío</h1>
        <p className="mb-8 text-text-muted">Agregá productos para continuar con el checkout.</p>
        <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface hover:bg-primary-hover">
          Volver a la tienda
        </a>
      </div>
    );
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica temprana
    
    // Aquí se conectaría con la API de orders para guardar en BD (Supabase)
    // y luego redirigir a MercadoPago o WhatsApp según el medio de pago.
    
    if (paymentMethod === 'transfer') {
      const message = `Hola, quiero confirmar mi orden de compra por un total de $${getTotal().toLocaleString('es-AR')}. Adjunto el comprobante de transferencia.`;
      const url = `https://wa.me/5491100000000?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      alert("Redirigiendo a Mercado Pago (Checkout Pro)...");
      // Integración con MercadoPago Preference API aquí
    }
  };

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-text-main mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Datos Personales */}
              <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-text-main">1. Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Nombre y Apellido</label>
                    <input required type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Celular / WhatsApp *</label>
                    <input required type="tel" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-1">Correo Electrónico</label>
                    <input required type="email" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              </div>

              {/* Datos de Entrega */}
              <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-text-main">2. Entrega</h2>
                <div className="flex gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium">Envío a domicilio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="delivery" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium">Retiro por local</span>
                  </label>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-muted mb-1">Dirección completa</label>
                      <input required type="text" placeholder="Calle, Número, Piso/Dpto..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Localidad / Ciudad</label>
                      <input required type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Código Postal (CP) *</label>
                      <input required type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-muted mb-1">Notas de entrega (Opcional)</label>
                      <textarea rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Pago */}
              <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-text-main">3. Medio de Pago</h2>
                <div className="space-y-3">
                  <label className={`block cursor-pointer rounded-md border p-4 transition-colors ${paymentMethod === 'mercadopago' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="font-medium">Mercado Pago / Tarjetas / QR</span>
                    </div>
                  </label>
                  
                  <label className={`block cursor-pointer rounded-md border p-4 transition-colors ${paymentMethod === 'transfer' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="font-medium">Transferencia Bancaria Directa</span>
                    </div>
                    {paymentMethod === 'transfer' && (
                      <div className="ml-7 mt-3 text-sm text-text-muted">
                        <p>Alias: <strong>FERRETERIA.ONLINE</strong></p>
                        <p>CBU: <strong>0000000000000000000000</strong></p>
                        <p className="mt-2">Confirmá tu orden y envianos el comprobante por WhatsApp.</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Resumen de la orden */}
          <div className="lg:col-span-4">
            <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-text-main">Resumen de Orden</h2>
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-text-muted">{item.quantity}x {item.product.title}</span>
                    <span className="font-medium text-text-main">${(item.product.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg text-text-main">
                  <span>Total</span>
                  <span>${getTotal().toLocaleString('es-AR')}</span>
                </div>
                <p className="text-xs text-text-muted mt-1 text-right">* Envío a coordinar</p>
              </div>
              <Button form="checkout-form" type="submit" variant="primary" className="w-full py-3 text-base">
                Confirmar y Pagar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
