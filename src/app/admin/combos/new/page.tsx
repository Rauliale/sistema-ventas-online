'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import { supabase } from '../../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { PackagePlus, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  sku: string;
  cost_price: number | null;
  price: number;
}

interface ComboItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export default function NewComboPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    // Cargar todos los productos que no son combos
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, cost_price, price')
        .eq('is_combo', false)
        .eq('is_active', true);
      
      if (!error && data) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  // Calcular costo total del combo
  const totalCost = comboItems.reduce((acc, item) => {
    const cost = item.product?.cost_price || 0;
    return acc + (cost * item.quantity);
  }, 0);

  // Calcular precio sugerido (sumando los precios de venta individuales)
  const suggestedPrice = comboItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  // Calcular precio final basado en la ganancia sobre el costo
  let finalPrice = suggestedPrice;
  if (totalCost > 0 && profitMargin !== '') {
    const margin = parseFloat(profitMargin);
    if (!isNaN(margin)) {
      finalPrice = totalCost * (1 + margin / 100);
    }
  }

  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    // Evitar duplicados, mejor incrementar cantidad
    const existing = comboItems.find(i => i.product_id === selectedProductId);
    if (existing) {
      setComboItems(comboItems.map(i => 
        i.product_id === selectedProductId 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      ));
    } else {
      const product = products.find(p => p.id === selectedProductId);
      setComboItems([...comboItems, { product_id: selectedProductId, quantity: 1, product }]);
    }
    setSelectedProductId('');
  };

  const handleRemoveItem = (id: string) => {
    setComboItems(comboItems.filter(i => i.product_id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 1) return;
    setComboItems(comboItems.map(i => 
      i.product_id === id ? { ...i, quantity: qty } : i
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comboItems.length === 0) {
      toast.error('El combo debe tener al menos un producto');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Crear el producto combo
      const { data: comboData, error: comboError } = await supabase
        .from('products')
        .insert([{
          title,
          sku,
          description,
          cost_price: totalCost,
          profit_margin: profitMargin ? parseFloat(profitMargin) : null,
          price: finalPrice,
          compare_at_price: suggestedPrice > finalPrice ? suggestedPrice : null,
          images: imageUrl ? [imageUrl] : [],
          is_combo: true,
          is_active: true
        }])
        .select()
        .single();

      if (comboError) throw comboError;

      // 2. Insertar los items del combo
      const itemsToInsert = comboItems.map(item => ({
        combo_id: comboData.id,
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('combo_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('¡Combo creado correctamente!');
      router.push('/admin/products'); // Volvemos al listado de productos
    } catch (err: any) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al crear el combo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <PackagePlus className="h-8 w-8 text-primary" />
          Crear Nuevo Combo Promocional
        </h1>
        <p className="text-gray-500 mt-2">
          Agrupa varias herramientas. El costo se sumará automáticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Columna Izquierda: Datos del Combo */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Datos Básicos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Combo *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Ej: Kit Instalador de Aires..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU / Código *</label>
                <input required type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Ej: COMBO-001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Este combo incluye..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-blue-200 pb-2">Precios Inteligentes</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded-md border border-blue-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Costo Total Combo</p>
                <p className="text-xl font-bold text-gray-900">${totalCost.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-blue-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Valor Real (Sueltos)</p>
                <p className="text-xl font-bold text-gray-900 line-through text-gray-400">${suggestedPrice.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ganancia Deseada (%)</label>
                <input type="number" step="0.1" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Ej: 20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Precio de Venta Final</label>
                <div className="w-full rounded-md bg-primary text-white font-bold px-3 py-2 text-lg">
                  ${finalPrice.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Si el precio final es menor al valor real, el sistema tachará el valor real automáticamente.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Productos del Combo */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Herramientas Incluidas</h2>
            
            <div className="flex gap-2 mb-6">
              <select 
                value={selectedProductId} 
                onChange={e => setSelectedProductId(e.target.value)} 
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Buscar herramienta...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.title}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="bg-gray-900 text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {comboItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  No has agregado ninguna herramienta al combo.
                </div>
              ) : (
                comboItems.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-bold text-gray-500">{item.product?.sku}</p>
                      <p className="text-sm font-medium line-clamp-1">{item.product?.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={e => handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-center"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="text-danger hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 border-t pt-4 flex gap-3">
              <Link href="/admin/products" className="flex-1">
                <Button type="button" variant="ghost" className="w-full">Cancelar</Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                Crear Combo
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
