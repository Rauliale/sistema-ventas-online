'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Product } from '../../../lib/api/products';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*').eq('is_combo', false).order('created_at', { ascending: false });
      if (data) setProducts(data as Product[]);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-main">Catálogo de Productos</h1>
        <div className="flex gap-3">
          <Link href="/admin/combos/new">
            <Button variant="secondary" className="gap-2 bg-gray-200 text-gray-900 hover:bg-gray-300">
              <Plus className="h-4 w-4" />
              Nuevo Combo
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted">Cargando productos...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-text-muted">SKU</th>
                <th className="px-6 py-3 font-medium text-text-muted">Producto</th>
                <th className="px-6 py-3 font-medium text-text-muted">Precio</th>
                <th className="px-6 py-3 font-medium text-text-muted">Estado</th>
                <th className="px-6 py-3 font-medium text-text-muted text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No hay productos cargados en la base de datos.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4 font-medium text-text-main">{product.title}</td>
                    <td className="px-6 py-4">${product.price.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/products/${product.id}`} className="text-primary hover:underline text-sm font-medium">Editar</Link>
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
