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
      {/* Hero Banner */}
      <section className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-8 py-16 text-surface shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Construye con <span className="text-secondary">Confianza</span>
          </h1>
          <p className="mb-8 text-lg text-blue-100 md:text-xl">
            Encontrá las mejores herramientas manuales, eléctricas y accesorios para tu proyecto. Calidad y garantía en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 font-bold text-gray-900 shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all">
              Ver Catálogo
            </button>
            <button className="w-full sm:w-auto rounded-full border-2 border-surface px-8 py-3 font-bold text-surface hover:bg-white/10 transition-all">
              Promociones
            </button>
          </div>
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
