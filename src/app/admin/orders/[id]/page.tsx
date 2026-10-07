'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, MessageCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (orderError) {
        toast.error('No se pudo cargar el pedido');
        router.push('/admin/orders');
        return;
      }
      setOrder(orderData);

      // Fetch items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
        
      if (itemsData) setItems(itemsData);
      
      setIsLoading(false);
    };

    if (id) fetchOrderDetails();
  }, [id, router]);

  const updateStatus = async (field: 'order_status' | 'payment_status', value: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', id);
      
    setIsUpdating(false);
    if (error) {
      toast.error('Error al actualizar estado: ' + error.message);
    } else {
      toast.success('Estado actualizado');
      setOrder((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const updateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    const provider = (e.target as any).provider.value;
    const code = (e.target as any).tracking.value;
    const tracking = provider && code ? `${provider}|${code}` : code;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: tracking })
      .eq('id', id);
      
    setIsUpdating(false);
    if (error) {
      toast.error('Error al guardar tracking: ' + error.message);
    } else {
      toast.success('Código de seguimiento guardado');
      setOrder((prev: any) => ({ ...prev, tracking_number: tracking }));
    }
  };

  const getTrackingInfo = (trackingString: string | null) => {
    if (!trackingString) return { provider: '', code: '' };
    if (trackingString.includes('|')) {
      const [provider, code] = trackingString.split('|');
      return { provider, code };
    }
    return { provider: '', code: trackingString };
  };

  const getProviderName = (providerId: string) => {
    switch(providerId) {
      case 'andreani': return 'Andreani';
      case 'correo_argentino': return 'Correo Argentino';
      case 'oca': return 'OCA';
      case 'urbano': return 'Urbano';
      case 'via_cargo': return 'Vía Cargo';
      default: return 'la empresa de transporte';
    }
  };

  const getProviderUrl = (providerId: string, code: string) => {
    switch(providerId) {
      case 'andreani': return `https://seguimiento.andreani.com/envio/${code}`;
      case 'correo_argentino': return `https://www.correoargentino.com.ar/formularios/e-commerce`; 
      case 'oca': return `https://www.oca.com.ar/Envios/Paquetes/?numero=${code}`;
      case 'urbano': return `https://www.urbano.com.ar/`;
      case 'via_cargo': return `https://www.viacargo.com.ar/tracking`;
      default: return null;
    }
  };

  const handleWhatsAppNotification = () => {
    let message = `Hola ${order.customer_name}! 👋 Te contactamos de Ferretería Online.\n\nTe escribimos sobre tu pedido #${order.order_number}:\n\n`;
    
    switch (order.order_status) {
      case 'new':
        message += `¡Hemos recibido tu pedido con éxito! Ya lo estamos revisando.`;
        break;
      case 'preparing':
        message += `¡Tu pedido ya está en preparación! Pronto estará listo.`;
        break;
      case 'shipped':
        message += `🚚 ¡Tu pedido ya fue despachado!`;
        if (order.tracking_number) {
          const { provider, code } = getTrackingInfo(order.tracking_number);
          const providerName = getProviderName(provider);
          const url = getProviderUrl(provider, code);
          
          if (provider && url) {
            message += `\n\nTu envío va por *${providerName}*. Ingresá a este enlace y seguí tu pedido con el número de referencia: *${code}*\n🔗 ${url}`;
          } else {
            message += `\n\nTu código de seguimiento es: *${code}*`;
          }
        }
        break;
      case 'delivered':
        message += `✅ ¡Tu pedido figura como entregado! Esperamos que lo disfrutes.`;
        break;
      case 'cancelled':
        message += `❌ Lamentamos informarte que tu pedido ha sido cancelado. Si tienes dudas, consúltanos por aquí.`;
        break;
    }
    
    let rawPhone = order.customer_phone.replace(/\D/g, '');
    // Formateo inteligente para números de Argentina
    if (rawPhone.startsWith('549')) {
      // Está correcto
    } else if (rawPhone.startsWith('54')) {
      rawPhone = '549' + rawPhone.substring(2); // Agrega el 9 de celular
    } else if (rawPhone.startsWith('0')) {
      rawPhone = '549' + rawPhone.substring(1); // Reemplaza el 0 por 549
    } else if (rawPhone.length === 10) {
      rawPhone = '549' + rawPhone; // Si puso 10 números (ej 1144445555)
    }
    
    const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  if (isLoading) return <div className="p-8 text-center text-text-muted">Cargando detalles de la orden...</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">Pedido #{order.order_number}</h1>
        </div>
        <Button variant="secondary" onClick={() => window.print()} className="flex gap-2 print:hidden">
          <Printer className="h-4 w-4" /> Imprimir Remito
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Items & Customer */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Items */}
          <div className="bg-surface rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-text-main">Artículos del Pedido</h2>
            </div>
            <div className="p-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-gray-100">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium text-center">Cant.</th>
                    <th className="pb-2 font-medium text-right">Precio Unit.</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="py-3">{item.product_title}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">${item.unit_price.toLocaleString('es-AR')}</td>
                      <td className="py-3 text-right font-medium">${(item.unit_price * item.quantity).toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-4 text-right font-bold text-lg">Total General:</td>
                    <td className="py-4 text-right font-bold text-lg text-primary">${order.total_amount.toLocaleString('es-AR')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-surface rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-text-main">Información del Cliente y Envío</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="text-text-muted mb-1 text-xs uppercase font-semibold">Datos de Contacto</h3>
                <p className="font-medium">{order.customer_name}</p>
                <p>
                  <a 
                    href={`https://wa.me/${
                      order.customer_phone.replace(/\D/g, '').startsWith('54') 
                        ? order.customer_phone.replace(/\D/g, '') 
                        : order.customer_phone.replace(/\D/g, '').startsWith('0')
                          ? '549' + order.customer_phone.replace(/\D/g, '').substring(1)
                          : '549' + order.customer_phone.replace(/\D/g, '')
                    }`} 
                    target="_blank" 
                    className="text-primary hover:underline"
                  >
                    {order.customer_phone}
                  </a>
                </p>
                <p>{order.customer_email}</p>
              </div>
              
              <div>
                <h3 className="text-text-muted mb-1 text-xs uppercase font-semibold">Modalidad de Entrega</h3>
                <p className="font-medium">
                  {order.shipping_type === 'delivery' ? 'Envío a domicilio' : 'Retiro en el local'}
                </p>
                {order.shipping_type === 'delivery' && order.shipping_address && (
                  <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-100">
                    <p>{order.shipping_address.street}</p>
                    <p>{order.shipping_address.city} - CP: {order.shipping_address.postal_code}</p>
                    {order.shipping_address.notes && (
                      <p className="mt-2 text-xs italic text-text-muted">Notas: {order.shipping_address.notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-6 print:hidden">
          
          <div className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-text-main mb-4">Estado del Pago</h2>
            <div className="mb-4 text-sm">
              <span className="text-text-muted">Método:</span> <span className="font-medium capitalize">{order.payment_method}</span>
            </div>
            <select 
              value={order.payment_status} 
              onChange={(e) => updateStatus('payment_status', e.target.value)}
              disabled={isUpdating}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="pending">Pendiente de Pago</option>
              <option value="approved">Pago Aprobado</option>
              <option value="rejected">Pago Rechazado</option>
            </select>
          </div>

          <div className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-text-main mb-4">Estado del Pedido</h2>
            <select 
              value={order.order_status} 
              onChange={(e) => updateStatus('order_status', e.target.value)}
              disabled={isUpdating}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none mb-4"
            >
              <option value="new">Nuevo</option>
              <option value="preparing">En Preparación</option>
              <option value="shipped">Despachado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <Button 
              type="button" 
              onClick={handleWhatsAppNotification}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              <MessageCircle className="h-4 w-4" /> Notificar estado por WhatsApp
            </Button>

            <form onSubmit={updateTracking} className="pt-4 border-t border-gray-100 mt-4">
              <label className="block text-sm font-medium text-text-main mb-2">Envío y Seguimiento</label>
              <div className="space-y-2">
                <select 
                  name="provider"
                  defaultValue={getTrackingInfo(order.tracking_number).provider}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Otro / Personalizado</option>
                  <option value="andreani">Andreani</option>
                  <option value="correo_argentino">Correo Argentino</option>
                  <option value="oca">OCA</option>
                  <option value="urbano">Urbano</option>
                  <option value="via_cargo">Vía Cargo</option>
                </select>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="tracking" 
                    defaultValue={getTrackingInfo(order.tracking_number).code}
                    placeholder="Código de Seguimiento (Ej: TN00000)"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" variant="primary" disabled={isUpdating}>Guardar</Button>
                </div>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
