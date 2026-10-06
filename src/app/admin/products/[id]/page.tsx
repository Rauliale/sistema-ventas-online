'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase/client';
import { Button } from '../../../../../components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    cost_price: '',
    profit_margin: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch categories
      const { data: catsData } = await supabase.from('categories').select('id, name');
      if (catsData) setCategories(catsData);

      // Fetch product
      if (productId) {
        const { data: prodData, error } = await supabase.from('products').select('*').eq('id', productId).single();
        if (prodData) {
          setFormData({
            sku: prodData.sku || '',
            title: prodData.title || '',
            description: prodData.description || '',
            cost_price: prodData.cost_price ? prodData.cost_price.toString() : '',
            profit_margin: prodData.profit_margin ? prodData.profit_margin.toString() : '',
            price: prodData.price ? prodData.price.toString() : '',
            compare_at_price: prodData.compare_at_price ? prodData.compare_at_price.toString() : '',
            category_id: prodData.category_id || '',
            image_url: prodData.images && prodData.images.length > 0 ? prodData.images[0] : '',
            is_active: prodData.is_active
          });
        } else if (error) {
          toast.error('No se pudo cargar el producto.');
          router.push('/admin/products');
        }
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, [productId, router]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const { data, error } = await supabase.from('categories').insert([{ name: newCategoryName }]).select();
    
    if (error) {
      toast.error('Error al crear categoría: ' + error.message);
    } else if (data && data.length > 0) {
      toast.success('Categoría agregada');
      setCategories(prev => [...prev, data[0]]);
      setFormData(prev => ({ ...prev, category_id: data[0].id }));
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  const handleGoogleSearch = () => {
    if (!formData.title) {
      toast.error('Escribe el Título del Producto primero para buscar su imagen.');
      return;
    }
    window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formData.title)}`, '_blank');
  };

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

    const { error } = await supabase.from('products').update(productPayload).eq('id', productId);

    setIsSubmitting(false);

    if (error) {
      toast.error(`Error al actualizar: ${error.message}`);
    } else {
      toast.success('Producto actualizado exitosamente');
      router.push('/admin/products');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Cargando producto...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Editar Producto</h1>
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
            {!isCreatingCategory ? (
              <div className="flex gap-2">
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Selecciona una categoría...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setIsCreatingCategory(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md text-text-main transition-colors">
                  + Nueva
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="Nombre categoría..." 
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none text-sm" 
                  autoFocus
                />
                <button type="button" onClick={handleCreateCategory} className="px-3 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors">
                  Guardar
                </button>
                <button type="button" onClick={() => setIsCreatingCategory(false)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md text-text-main transition-colors">
                  X
                </button>
              </div>
            )}
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
            
            {formData.image_url && !imageFile && (
              <div className="mb-4">
                <img src={formData.image_url} alt="Vista previa" className="h-24 w-24 object-cover rounded-md border border-gray-200" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted mb-1 block">Reemplazar desde la PC:</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary bg-white text-sm" 
                />
              </div>
              <div>
                <span className="text-xs text-text-muted mb-1 block">O nueva URL directa:</span>
                <input 
                  type="url" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={(e) => {
                    handleChange(e);
                    setImageFile(null);
                  }} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white" 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  disabled={!!imageFile}
                />
              </div>
            </div>
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
            Actualizar Producto
          </Button>
        </div>
      </form>
    </div>
  );
}
