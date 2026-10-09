'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Users, Phone, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

interface Alert {
  order_item_id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  product_title: string;
  purchase_date: string;
  days_elapsed: number;
  repurchase_days: number;
  contacted: boolean;
}

export default function RetentionPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');

  const templates = {
    standard: "Hola {nombre}, ¿cómo estás? Hace unos {dias} días compraste '{producto}' con nosotros. Queríamos saber si necesitas reponer stock o si te podemos ayudar con algo más. ¡Saludos!",
    friendly: "¡Hola {nombre}! 👋 Pasábamos a saludarte. Vimos que llevaste '{producto}' hace un tiempito. ¿Cómo te viene rindiendo? Si necesitas reponer, avísanos y te lo preparamos.",
    discount: "Hola {nombre}. Te contactamos de Ferretería Online. Como compraste '{producto}' hace poco, te ofrecemos un 10% de descuento en tu próxima reposición. ¿Te interesa?"
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      // Obtenemos los order_items que corresponden a productos consumibles
      // Nota: asume que las columnas is_consumable y repurchase_days existen en products
      // y repurchase_contacted en order_items.
      
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          product_title,
          repurchase_contacted,
          products (
            is_consumable,
            repurchase_days
          ),
          orders (
            customer_name,
            customer_phone,
            created_at,
            order_status
          )
        `);
        
      if (itemsError) throw itemsError;

      const alertsData: Alert[] = [];
      const now = new Date();

      orderItemsData?.forEach((item: any) => {
        // Filtrar solo productos que son consumibles
        if (item.products?.is_consumable && item.orders?.order_status !== 'cancelled') {
          const purchaseDate = new Date(item.orders.created_at);
          const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const targetDays = item.products.repurchase_days || 30;

          // Si ya pasaron los días sugeridos de recompra (o están cerca, ej: a 5 días)
          if (diffDays >= targetDays - 5) {
            alertsData.push({
              order_item_id: item.id,
              order_id: item.order_id,
              customer_name: item.orders.customer_name,
              customer_phone: item.orders.customer_phone,
              product_title: item.product_title,
              purchase_date: item.orders.created_at,
              days_elapsed: diffDays,
              repurchase_days: targetDays,
              contacted: item.repurchase_contacted || false,
            });
          }
        }
      });

      // Ordenar: primero los no contactados, luego los de mayor tiempo transcurrido
      alertsData.sort((a, b) => {
        if (a.contacted === b.contacted) {
          return b.days_elapsed - a.days_elapsed;
        }
        return a.contacted ? 1 : -1;
      });

      setAlerts(alertsData);
    } catch (err: any) {
      console.error('Error fetching retention alerts:', err);
      toast.error('No se pudieron cargar las alertas. Verifica que agregaste las nuevas columnas a la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkContacted = async (orderItemId: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ repurchase_contacted: true })
        .eq('id', orderItemId);

      if (error) throw error;
      
      toast.success('Marcado como contactado');
      setAlerts(prev => prev.map(a => a.order_item_id === orderItemId ? { ...a, contacted: true } : a));
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const sendWhatsApp = (alert: Alert) => {
    let rawPhone = alert.customer_phone.replace(/\D/g, '');
    if (rawPhone.startsWith('549')) {
      // ok
    } else if (rawPhone.startsWith('54')) {
      rawPhone = '549' + rawPhone.substring(2);
    } else if (rawPhone.startsWith('0')) {
      rawPhone = '549' + rawPhone.substring(1);
    } else if (rawPhone.length === 10) {
      rawPhone = '549' + rawPhone;
    }

    let messageTemplate = templates[selectedTemplate as keyof typeof templates];
    let message = messageTemplate
      .replace('{nombre}', alert.customer_name)
      .replace('{producto}', alert.product_title)
      .replace('{dias}', alert.days_elapsed.toString());

    const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
    
    // Si no estaba contactado, lo marcamos automáticamente al abrir WA
    if (!alert.contacted) {
      handleMarkContacted(alert.order_item_id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Panel de Retención y Recompras
        </h1>
        <p className="text-gray-500 mt-2">
          Contacta a clientes que compraron insumos consumibles y podrían necesitar reposición.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-3 text-blue-900">Configuración de Mensajes</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="text-sm font-medium text-blue-800 shrink-0">Plantilla a utilizar:</label>
          <select 
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="rounded-md border border-blue-200 px-3 py-2 text-sm focus:border-primary flex-1 max-w-md"
          >
            <option value="standard">Estándar (Pregunta directa)</option>
            <option value="friendly">Amigable (Seguimiento relajado)</option>
            <option value="discount">Con Descuento (Incentivo 10%)</option>
          </select>
        </div>
        <p className="text-xs text-blue-600 mt-3 italic">
          "{templates[selectedTemplate as keyof typeof templates]}"
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Cliente</th>
              <th className="px-6 py-3 font-medium text-gray-500">Consumible Comprado</th>
              <th className="px-6 py-3 font-medium text-gray-500">Tiempo Transcurrido</th>
              <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Analizando compras pasadas...</td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay clientes listos para reposición en este momento.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.order_item_id} className={`hover:bg-gray-50 ${alert.contacted ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{alert.customer_name}</p>
                    <p className="text-xs text-gray-500">{alert.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 line-clamp-1" title={alert.product_title}>
                      {alert.product_title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hace {alert.days_elapsed} días
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${alert.days_elapsed >= alert.repurchase_days ? 'text-danger' : 'text-yellow-500'}`} />
                      <span className={`font-medium ${alert.days_elapsed >= alert.repurchase_days ? 'text-danger' : 'text-yellow-600'}`}>
                        {alert.days_elapsed} / {alert.repurchase_days} días
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {alert.contacted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Contactado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => sendWhatsApp(alert)}
                      className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white whitespace-nowrap"
                    >
                      <Phone className="h-4 w-4" /> Enviar Mensaje
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
