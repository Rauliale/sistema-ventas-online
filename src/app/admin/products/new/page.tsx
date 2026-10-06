'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productPayload = {
      sku: formData.sku,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      category_id: formData.category_id || null,
      images: formData.image_url ? [formData.image_url] : [],
      is_active: formData.is_active
    };

    const { error } = await supabase.from('products').insert(productPayload);

    setIsSubmitting(false);

    if (error) {
      toast.error(`Error al guardar: ${error.message}`);
    } else {
      toast.success('Producto creado exitosamente');
      router.push('/admin/products');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Crear Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1">Título del Producto *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: Taladro Inalámbrico 18V" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">SKU / Código *</label>
            <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: TLD-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Categoría</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Selecciona una categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Precio Final ($) *</label>
            <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: 150000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Precio Comparación (Tachado)</label>
            <input type="number" min="0" step="0.01" name="compare_at_price" value={formData.compare_at_price} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Opcional. Ej: 180000" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1">URL de la Imagen</label>
            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://ejemplo.com/imagen.jpg" />
            <p className="text-xs text-text-muted mt-1">Por ahora se usa un enlace directo a la imagen.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Detalles técnicos y características del producto..." />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <label htmlFor="is_active" className="text-sm font-medium text-text-main">Producto Activo (Visible en la tienda)</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6 mt-6">
          <Link href="/admin/products">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Guardar Producto
          </Button>
        </div>
      </form>
    </div>
  );
}
