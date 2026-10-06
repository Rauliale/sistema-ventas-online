import { supabase } from '../supabase/client';

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string;
  is_active: boolean;
}

// Wrapper for Supabase data fetching to decouple from UI
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('No se pudieron cargar los productos');
  }

  return data as Product[];
};
