import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { customer, phone, address, total, items } = await req.json();

    // Generate order ID
    const { data: idData, error: idError } = await supabase.rpc("generate_order_id");
    if (idError) throw idError;
    const orderId = idData as string;

    // Create order
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer,
      phone,
      address,
      total,
      status: "pending",
    });
    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // Log activity
    await supabase.from("activity_log").insert({
      action: "طلب جديد",
      details: `طلب جديد #${orderId} — ${customer} — ${total} د.إ`,
      actor: customer,
    });

    return new Response(JSON.stringify({ orderId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
