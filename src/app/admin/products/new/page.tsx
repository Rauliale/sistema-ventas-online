'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleGoogleSearch = () => {
    if (!formData.title) {
      toast.error('Escribe el Título del Producto primero para buscar su imagen.');
      return;
    }
    window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formData.title)}`, '_blank');
  };

  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    cost_price: '',
    profit_margin: '30', // Margen por defecto
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
    
    setFormData(prev => {
      let newState = { ...prev };
      
      if (type === 'checkbox') {
        newState[name as keyof typeof newState] = (e.target as HTMLInputElement).checked as never;
      } else {
        newState[name as keyof typeof newState] = value as never;
      }

      // Auto-calcular Precio de Venta si cambia el costo o el margen
      if (name === 'cost_price' || name === 'profit_margin') {
        const cost = parseFloat(name === 'cost_price' ? value : newState.cost_price) || 0;
        const margin = parseFloat(name === 'profit_margin' ? value : newState.profit_margin) || 0;
        if (cost >= 0 && margin >= 0) {
          const finalPrice = cost * (1 + margin / 100);
          newState.price = finalPrice.toFixed(2);
        }
      }

      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedImageUrl = formData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);
        
      if (uploadError) {
        toast.error(`Error subiendo imagen: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      uploadedImageUrl = publicUrlData.publicUrl;
    }

    const productPayload = {
      sku: formData.sku,
      title: formData.title,
      description: formData.description,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : null,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      category_id: formData.category_id || null,
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
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

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Precio de Costo ($)</label>
              <input type="number" min="0" step="0.01" name="cost_price" value={formData.cost_price} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: 10000" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Ganancia (%)</label>
              <input type="number" min="0" step="0.1" name="profit_margin" value={formData.profit_margin} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: 30" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Precio Final de Venta ($) *</label>
              <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-md border-primary border-2 bg-blue-50 px-3 py-2 focus:border-primary focus:outline-none" placeholder="Calculado auto" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Precio Comparación (Tachado)</label>
            <input type="number" min="0" step="0.01" name="compare_at_price" value={formData.compare_at_price} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Opcional. Ej: 180000" />
          </div>

          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-main">Imagen del Producto</label>
              <button type="button" onClick={handleGoogleSearch} className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                <Search className="h-4 w-4" />
                Buscar imagen en Google
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted mb-1 block">Subir desde la PC:</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                      setFormData(prev => ({ ...prev, image_url: '' })); // Clear URL if file selected
                    }
                  }} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary bg-white text-sm" 
                />
              </div>
              <div>
                <span className="text-xs text-text-muted mb-1 block">O pegar URL directa:</span>
                <input 
                  type="url" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={(e) => {
                    handleChange(e);
                    setImageFile(null); // Clear file if URL is typed
                  }} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white" 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  disabled={!!imageFile}
                />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2">Puedes subir una imagen desde tu PC o pegar directamente un enlace.</p>
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
