import { getProducts, Product } from "../lib/api/products";
import { ProductCatalog } from "../components/catalog/ProductCatalog";

export const revalidate = 60; // ISR revalidation every 60 seconds

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (err: any) {
    error = err.message;
  }

  // Fallback dummy data if DB is empty or no env vars (for MVP UI)
  if (products.length === 0 && !error) {
    products = [
      {
        id: "1",
        sku: "TLD-001",
        title: "Taladro Inalámbrico 18V - 2 Baterías",
        description: "Taladro percutor con 2 baterías de litio.",
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
      {/* Banner promocional */}
      <section className="mb-12 rounded-xl bg-primary p-8 text-surface shadow-md">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold">Ofertas de Temporada</h1>
          <p className="mb-6 text-lg text-primary-100 opacity-90">
            Aprovechá los mejores combos en herramientas eléctricas e inalámbricas. 
            Calidad garantizada.
          </p>
          <button className="rounded-md bg-secondary px-6 py-3 font-semibold text-text-main hover:bg-yellow-500 transition-colors">
            Ver Combos
          </button>
        </div>
      </section>

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
