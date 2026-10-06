import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Usamos el service_role key para poder actualizar la DB saltándonos las reglas de seguridad (RLS)
// ya que este código corre en el servidor seguro, no en el navegador.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type') || url.searchParams.get('topic');

    // Mercado Pago envía 'payment' en el type cuando se crea/actualiza un pago
    if (type === 'payment' && id) {
      if (!accessToken) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
      }

      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);
      
      // Consultamos a Mercado Pago el estado real de este pago (para evitar fraudes)
      const paymentInfo = await payment.get({ id });
      
      const orderId = paymentInfo.external_reference;
      const paymentStatus = paymentInfo.status; // 'approved', 'pending', 'rejected', etc.
      
      if (orderId) {
        // Actualizamos nuestra base de datos
        const { error } = await supabaseAdmin
          .from('orders')
          .update({ payment_status: paymentStatus })
          .eq('id', orderId);

        if (error) {
          console.error('Error actualizando orden en Supabase:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        console.log(`Orden ${orderId} actualizada a estado: ${paymentStatus}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error en webhook de Mercado Pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
