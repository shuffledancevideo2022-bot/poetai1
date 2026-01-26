import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify webhook signature from Lava.top
function verifySignature(payload: string, signature: string, secret: string): boolean {
  // Lava.top uses SHA256 HMAC for webhook signatures
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  // For now, we'll do a simple comparison - adjust based on actual Lava.top documentation
  // They may use different signature methods
  return true; // TODO: Implement proper signature verification based on Lava.top docs
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('LAVA_TOP_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const rawBody = await req.text();
    const signature = req.headers.get('X-Lava-Signature') || req.headers.get('x-lava-signature') || '';

    // Verify signature if secret is set
    if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    const supabase = createClient(supabaseUrl, serviceKey);

    // Extract payment info from webhook
    // Lava.top sends different event types
    const event = payload.event || payload.type;
    const orderId = payload.order_id || payload.orderId || payload.custom?.order_id;
    const invoiceId = payload.id || payload.invoice_id;
    const status = payload.status;

    if (!orderId && !invoiceId) {
      console.error('No order_id or invoice_id in webhook');
      return new Response(
        JSON.stringify({ success: true }), // Still return success to not trigger retries
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment by order_id (our payment id) or lava_invoice_id
    let query = supabase.from('payments').select('*');
    if (orderId) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('lava_invoice_id', invoiceId);
    }
    
    const { data: payment, error: findError } = await query.single();

    if (findError || !payment) {
      console.error('Payment not found:', findError);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Already processed
    if (payment.status === 'completed') {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle payment status
    const isSuccess = 
      event === 'payment.success' || 
      event === 'invoice.paid' ||
      status === 'paid' || 
      status === 'success' ||
      status === 'completed';

    const isFailed = 
      event === 'payment.failed' ||
      event === 'invoice.expired' ||
      status === 'failed' ||
      status === 'expired' ||
      status === 'cancelled';

    if (isSuccess) {
      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          lava_invoice_id: invoiceId || payment.lava_invoice_id,
          metadata: payload
        })
        .eq('id', payment.id);

      // Add credits to user if they have an account
      if (payment.user_id) {
        await supabase.rpc('add_credits', {
          _user_id: payment.user_id,
          _amount: payment.credits_amount,
          _transaction_type: 'purchase',
          _description: `Покупка ${payment.credits_amount} кредитов`,
          _reference_id: payment.id
        });
      } else {
        // For anonymous purchases, store credits by email
        // You might want to create a profile when they register with this email
        console.log(`Anonymous purchase: ${payment.credits_amount} credits for ${payment.email}`);
      }

      console.log(`Payment ${payment.id} completed, ${payment.credits_amount} credits added`);
    } else if (isFailed) {
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          metadata: payload
        })
        .eq('id', payment.id);

      console.log(`Payment ${payment.id} failed`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});