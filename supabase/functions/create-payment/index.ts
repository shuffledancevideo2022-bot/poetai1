import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  productId: string;
  email: string;
  currency?: 'RUB' | 'USD' | 'EUR';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lavaApiKey = Deno.env.get('LAVA_TOP_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    // Get user if authenticated
    let userId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabase.auth.getClaims(token);
      if (claimsData?.claims) {
        userId = claimsData.claims.sub as string;
      }
    }

    const { productId, email, currency = 'RUB' }: CreatePaymentRequest = await req.json();

    if (!productId || !email) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать productId и email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('credit_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Продукт не найден' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine price based on currency
    let amount: number;
    switch (currency) {
      case 'USD':
        amount = product.price_usd || product.price_rub / 100;
        break;
      case 'EUR':
        amount = product.price_eur || product.price_rub / 110;
        break;
      default:
        amount = product.price_rub;
    }

    // Create payment record in database
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        product_id: productId,
        amount,
        currency,
        credits_amount: product.credits,
        email,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Ошибка создания платежа' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invoice via Lava.top API
    const lavaResponse = await fetch('https://api.lava.top/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': lavaApiKey,
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: currency,
        email: email,
        order_id: payment.id,
        success_url: `${req.headers.get('origin') || 'https://poetai1.lovable.app'}/payment/success?id=${payment.id}`,
        fail_url: `${req.headers.get('origin') || 'https://poetai1.lovable.app'}/payment/failed?id=${payment.id}`,
        hook_url: `${supabaseUrl}/functions/v1/lava-webhook`,
        expire: 3600, // 1 hour
        comment: `Покупка ${product.credits} кредитов PoetAI`,
        buyer_language: 'ru',
      }),
    });

    const lavaData = await lavaResponse.json();

    if (!lavaResponse.ok || lavaData.error) {
      console.error('Lava API error:', lavaData);
      // Delete failed payment
      await supabaseAdmin.from('payments').delete().eq('id', payment.id);
      return new Response(
        JSON.stringify({ error: 'Ошибка создания платежа в Lava.top' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payment with Lava invoice ID
    await supabaseAdmin
      .from('payments')
      .update({ lava_invoice_id: lavaData.id })
      .eq('id', payment.id);

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        paymentUrl: lavaData.url || lavaData.payment_url,
        invoiceId: lavaData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});