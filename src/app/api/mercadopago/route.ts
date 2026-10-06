import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Reemplazar el access token por el de tu cuenta. Idealmente desde process.env
const accessToken = process.env.MP_ACCESS_TOKEN || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderData, items } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Falta configurar MP_ACCESS_TOKEN' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const preference = new Preference(client);

    const preferenceItems = items.map((item: any) => ({
      id: item.product_id,
      title: item.product_title,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      currency_id: 'ARS',
    }));

    const result = await preference.create({
      body: {
        items: preferenceItems,
        payer: {
          name: orderData.customer_name,
          email: orderData.customer_email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?status=pending`,
        },
        auto_return: 'approved',
        external_reference: orderData.id, // Relacionamos el pago con nuestro ID de orden
      }
    });

    return NextResponse.json({ init_point: result.init_point });
    
  } catch (error: any) {
    console.error('Error creando preferencia MP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
