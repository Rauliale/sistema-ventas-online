'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Button } from '../../../components/ui/Button';
import { Plus, PackagePlus } from 'lucide-react';
import Link from 'next/link';

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCombos = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_combo', true)
        .order('created_at', { ascending: false });
      if (data) setCombos(data);
      setIsLoading(false);
    };
    loadCombos();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <PackagePlus className="h-8 w-8 text-primary" />
          Gestión de Combos
        </h1>
        <Link href="/admin/combos/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Combo
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando combos...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">SKU</th>
                <th className="px-6 py-3 font-medium text-gray-500">Nombre del Combo</th>
                <th className="px-6 py-3 font-medium text-gray-500">Precio Final</th>
                <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No has creado ningún combo promocional todavía.
                  </td>
                </tr>
              ) : (
                combos.map((combo) => (
                  <tr key={combo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{combo.sku}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{combo.title}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${combo.price.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${combo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {combo.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
