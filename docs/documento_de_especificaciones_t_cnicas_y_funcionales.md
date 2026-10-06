# Especificación de Requerimientos de Software (SRS)
## Plataforma E-commerce de Ferretería e Insumos

---

### 1. Resumen del Proyecto y Modelo de Negocio

* **Nombre del Proyecto:** Ferretería Online (Catálogo y Venta Web).
* **Objetivo:** Desarrollar una tienda online moderna, rápida e intuitiva para comercializar herramientas e insumos ferreteros aprovechando el inventario de una ferretería física aliada, canalizando tráfico desde redes sociales (Instagram, Facebook Ads, TikTok) y cerrando ventas locales y nacionales.
* **Modelo Operativo (Afiliado / Venta Comisionada):**
  * **Catálogo siempre disponible:** Los productos están visibles permanentemente para compra y consulta sin mostrar números de stock residual al cliente.
  * **Actualización por lotes:** Los precios y disponibilidad se actualizarán de forma periódica (semanal/mensual) mediante planillas Excel provistas por la ferretería física.
  * **Costo de envío:** Modalidad *A coordinar con el vendedor / Pago en destino* según el código postal, peso y empresa de logística seleccionada (Correo Argentino, Andreani, Neo Mandados o cadetería local).
  * **Cobros:** Cobro directo mediante Mercado Pago (saldo/tarjetas/QR) o Transferencia Bancaria Directa (CBU/CVU), con envío de comprobante vía WhatsApp.

---

### 2. Stack Tecnológico

| Capa | Herramienta / Servicio | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Framework Web** | Next.js (React) + Antigravity UI / Tailwind CSS | Frontend responsivo, Server Components para carga instantánea y SEO amigable para indexar productos en Google. |
| **Base de Datos & Auth** | Supabase (PostgreSQL + Auth + Storage) | Almacenamiento relacional de productos, pedidos, clientes, imágenes en buckets y autenticación segura para el panel admin. |
| **Alojamiento & CDN** | Vercel | Despliegue continuo (CI/CD), escalabilidad automática y baja latencia en toda Argentina. |
| **Procesamiento de Pagos** | Mercado Pago SDK / Checkout Pro | Procesamiento de tarjetas, dinero en cuenta, QR interoperable y recepción de Webhooks. |
| **Atención al Cliente** | Integración WhatsApp API / Botón Flotante | Asesoramiento técnico en tiempo real y recepción ágil de comprobantes de pago. |

---

### 3. Requerimientos Funcionales

#### 3.1. Catálogo y Experiencia de Usuario (Frontend)
1. **Home y Landing Page:**
   * Banner principal rotativo enfocado en ofertas de temporada y combos de herramientas.
   * Navegación por categorías clave:
     * Herramientas Eléctricas e Inalámbricas.
     * Herramientas Manuales.
     * Pinturería y Selladores.
     * Plomería y Sanitarios.
     * Electricidad e Iluminación.
     * Bulonería, Tornillos y Fijaciones.
     * Seguridad y Protección Personal.
   * Grilla dinámica de "Más Vendidos" y "Ofertas de la Semana".
2. **Tarjeta y Ficha de Producto:**
   * Imágenes de alta calidad con optimización automática.
   * Título, marca, código de referencia/SKU y descripción técnica detallada.
   * Precio regular y precio promocional tachado (si aplica).
   * **Política de stock:** No se muestra cantidad disponible al cliente final para no desincentivar la compra; el botón **"Agregar al carrito"** siempre está habilitado mientras el producto esté activo.
   * Botón de consulta directa por WhatsApp con mensaje prearmado: *"Hola, tengo una duda sobre [Nombre del Producto] (SKU: [Código])"*.
3. **Buscador y Filtros:**
   * Barra de búsqueda predictiva en tiempo real (por nombre, marca o palabra clave).
   * Filtros laterales por categoría, marca y rango de precio.

#### 3.2. Carrito de Compras en Tiempo Real
1. **Drawer / Carrito Desplegable:**
   * Se abre automáticamente en el lateral derecho al hacer clic en "Agregar al carrito" sin recargar ni abandonar la página.
   * Contador visible en tiempo real en la barra de navegación con la cantidad total de artículos.
2. **Operaciones del Carrito:**
   * Aumentar (`+`) o disminuir (`-`) cantidad de ítems.
   * Eliminar producto con confirmación rápida.
   * Cálculo en vivo del **Subtotal**.
   * Cartel aclaratorio: *"El costo final de envío se coordina tras finalizar la orden según tu zona y peso del paquete."*
   * Botón de llamada a la acción: **"Continuar con la compra"**.

#### 3.3. Checkout y Formulario de Envío
Formulario en una sola página (One-page checkout), optimizado para celulares:
1. **Datos Personales y Contacto:**
   * Nombre y Apellido.
   * Teléfono celular / WhatsApp (campo obligatorio).
   * Correo electrónico.
2. **Datos de Destino y Entrega:**
   * Selección de Entrega:
     * *Envío a domicilio o sucursal de encomienda* (Correo Argentino, Andreani, Neo Mandados o transporte express).
     * *Retiro en el local de la ferretería* (sin cargo).
   * Dirección completa (Calle, Número, Piso/Dpto, Barrio/Localidad, Provincia).
   * **Código Postal (CP)** obligatorio para cotización de despacho posterior.
   * Notas adicionales para el despacho (ej.: *"Entregar por la tarde", "Timbre departamento B"*).
3. **Selección del Método de Pago:**
   * **Opción A - Mercado Pago / QR:**
     * Redirección segura o modal a Checkout Pro. Permite pagar con dinero en cuenta, tarjetas o escaneando QR.
     * Retorno automático a la web con confirmación inmediata (`Aprobado`, `Pendiente`, `Rechazado`).
   * **Opción B - Transferencia Bancaria Directa (Alias / CBU):**
     * Despliegue de datos de cuenta (Alias, CBU/CVU, Titular, CUIT/CUIL).
     * Botón directo con enlace a WhatsApp para remitir el comprobante adjuntando el número de orden asignado.

#### 3.4. Soporte y Botón Flotante de WhatsApp
* Widget accesible en todas las vistas de la tienda (esquina inferior derecha).
* Al hacer clic, abre chat con un menú rápido de consultas frecuentes:
  * "Quiero asesoramiento sobre una herramienta".
  * "Consultar costo de envío a mi localidad".
  * "Enviar comprobante de pago de mi pedido".

---

### 4. Módulo de Administración (Backoffice)

Panel protegido con login por Supabase Auth:
1. **Gestión de Pedidos:**
   * Listado de ventas recibidas ordenadas cronológicamente.
   * Filtros por estado: `Pendiente de Pago`, `Pago Confirmado`, `En Preparación`, `Despachado`, `Completado`.
   * Vista de orden con ficha de remito imprimible que incluye los datos postales del cliente para pegar en el paquete.
   * Registro del código de seguimiento (tracking number) de Correo Argentino / Andreani para enviárselo al cliente.
2. **Carga y Edición de Productos:**
   * Formulario manual para crear/editar productos (título, precio, fotos, descripción, categoría, estado activo/inactivo).
3. **Módulo de Importación / Actualización Masiva por Excel (Fase 2):**
   * Subida de archivo `.xlsx` o `.csv` provisto periódicamente por la ferretería.
   * Actualización automática de precios de venta y activación/desactivación por SKU o código de barra.

---

### 5. Arquitectura de Base de Datos (Supabase / PostgreSQL)

```sql
-- Extensión para generación de UUIDs
create extension if not exists "pgcrypto";

-- Tabla de Categorías
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Tabla de Productos
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  title text not null,
  description text,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2), -- Precio original tachado para liquidaciones
  images text[] default array[]::text[],
  category_id uuid references categories(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de Pedidos / Órdenes
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_type text not null check (shipping_type in ('delivery', 'pickup')),
  shipping_address jsonb, -- { street, number, floor_apt, city, province, postal_code, notes, courier_preference }
  payment_method text not null check (payment_method in ('mercadopago', 'transfer', 'qr')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected')),
  order_status text not null default 'new' check (order_status in ('new', 'preparing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  total_amount numeric(12, 2) not null,
  created_at timestamptz default now()
);

-- Tabla de Detalles de Orden (Items comprados)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_title text not null, -- Respaldo histórico del nombre al momento de compra
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null
);

-- Índices recomendados para velocidad de búsqueda
create index idx_products_category on products(category_id);
create index idx_products_is_active on products(is_active);
create index idx_orders_status on orders(order_status);
create index idx_orders_created on orders(created_at desc);
```

---

### 6. Roadmap y Fases de Implementación

1. **Fase 1 - MVP (Mínimo Producto Viable):**
   * Configuración de proyecto en Next.js, Antigravity y Supabase.
   * Catálogo con buscador, filtrado por categorías y tarjetas de productos atractivas.
   * Carrito de compras lateral interactivo con cálculo en tiempo real.
   * Checkout de un paso recopilando datos de envío (dirección, CP, empresa sugerida).
   * Integración de pagos con Mercado Pago (Checkout Pro) y opción de transferencia con redirección a WhatsApp.
   * Botón flotante persistente de WhatsApp.
2. **Fase 2 - Optimización Logística y Carga Masiva:**
   * Lector/importador de listas de precios en Excel para sincronizar con la ferretería física.
   * Panel administrativo con gestión de estados de pedido y generación de etiquetas de envío.
3. **Fase 3 - Marketing y Retargeting:**
   * Integración con Meta Pixel (Facebook/Instagram Ads) y Google Analytics para medir conversiones de compras y abandono de carritos.