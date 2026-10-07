import { getProducts, Product } from "../lib/api/products";
import { ProductCatalog } from "../components/catalog/ProductCatalog";
import { PromoCarousel } from "../components/ui/PromoCarousel";

export const revalidate = 60; // ISR revalidation every 60 seconds

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (err: any) {
    error = err.message;
  }

  // Filtrar promociones (combos o productos con descuento)
  const promos = products.filter(p => p.is_combo || (p.compare_at_price && p.compare_at_price > p.price));

  // Fallback dummy data if DB is empty or no env vars (for MVP UI)
  if (products.length === 0 && !error) {
    products = [
      {
        id: "1",
        sku: "TLD-001",
        title: "Taladro Inalámbrico 18V - 2 Baterías",
        description: "Taladro percutor con 2 baterías de litio.",
        cost_price: null,
        profit_margin: null,
        price: 150000,
        compare_at_price: 180000,
        images: [],
        category_id: "Herramientas Eléctricas",
        is_active: true
      },
      {
        id: "2",
        sku: "HMM-002",
        title: "Set de Herramientas Manuales 120 piezas",
        description: "Maletín completo de herramientas.",
        cost_price: null,
        profit_margin: null,
        price: 85000,
        compare_at_price: null,
        images: [],
        category_id: "Herramientas Manuales",
        is_active: true
      },
      {
        id: "3",
        sku: "PLM-003",
        title: "Llave de Paso Termofusión 20mm",
        description: "Llave de paso esférica de termofusión.",
        cost_price: null,
        profit_margin: null,
        price: 8500,
        compare_at_price: null,
        images: [],
        category_id: "Plomería",
        is_active: true
      }
    ];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Carrusel Dinámico de Promociones */}
      <PromoCarousel promos={promos} />

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-danger border border-red-200">
          Hubo un error cargando el catálogo: {error}
          <br />
          <span className="text-sm opacity-80">Por favor configure las variables de entorno de Supabase.</span>
        </div>
      ) : (
        <ProductCatalog initialProducts={products} />
      )}
    </div>
  );
}
