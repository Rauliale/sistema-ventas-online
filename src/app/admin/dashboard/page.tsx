'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';

export default function DashboardPage() {
  const [ordersCount, setOrdersCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // En una app real, esto llamaría a la tabla orders.
    // Por ahora mostramos contadores mock o leemos si existe la tabla
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          setOrdersCount(count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-text-muted">Pedidos Totales</h3>
          <p className="text-3xl font-bold text-primary mt-2">{ordersCount}</p>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-text-muted">Ingresos (Mes)</h3>
          <p className="text-3xl font-bold text-success mt-2">${revenue.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-text-muted">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold text-secondary mt-2">0</p>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">Últimos Pedidos</h2>
        <div className="text-center py-8 text-text-muted">
          No hay pedidos recientes. Cuando los clientes compren, aparecerán aquí.
        </div>
      </div>
    </div>
  );
}
