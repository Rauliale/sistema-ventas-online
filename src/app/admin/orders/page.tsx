'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(data);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Nuevo</span>;
      case 'preparing': return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">En Preparación</span>;
      case 'shipped': return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Despachado</span>;
      case 'delivered': return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Entregado</span>;
      case 'cancelled': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Cancelado</span>;
      default: return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pendiente</span>;
      case 'approved': return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Aprobado</span>;
      case 'rejected': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Rechazado</span>;
      default: return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">Gestión de Pedidos</h1>
      </div>

      <div className="bg-surface rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-main">
            <thead className="bg-gray-50 text-xs uppercase text-text-muted border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Orden #</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Pago</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                    No hay pedidos registrados.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">#{order.order_number}</td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-text-muted">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">${order.total_amount.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4">{getPaymentBadge(order.payment_status)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.order_status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">Ver detalle</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
