'use client';
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phone = "5491100000000"; // Reemplazar por el nro real

  const options = [
    { label: "Quiero asesoramiento sobre una herramienta", text: "Hola, necesito asesoramiento sobre una herramienta." },
    { label: "Consultar costo de envío a mi localidad", text: "Hola, me gustaría consultar el costo de envío a mi localidad. Mi código postal es: " },
    { label: "Enviar comprobante de pago de mi pedido", text: "Hola, te envío el comprobante de pago de mi orden #..." }
  ];

  const handleSend = (text: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-72 rounded-lg bg-surface p-4 shadow-xl border border-gray-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-text-main">¿En qué podemos ayudarte?</h3>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-main">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(opt.text)}
                className="rounded-md bg-gray-50 p-2 text-left text-sm text-text-main hover:bg-green-50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
};
