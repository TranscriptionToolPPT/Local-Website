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

    const { orderId, productName, reason, qty } = await req.json();

    // Generate return ID
    const { data: existing } = await supabase
      .from("returns")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    const nextNum = existing && existing.length > 0
      ? parseInt(existing[0].id.replace("RET-", "")) + 1
      : 1;
    const retId = `RET-${String(nextNum).padStart(3, "0")}`;

    // Create return record
    const { error: retError } = await supabase.from("returns").insert({
      id: retId,
      order_id: orderId,
      product_name: productName,
      reason,
      qty,
    });
    if (retError) throw retError;

    // Update order status
    await supabase.from("orders").update({ status: "returned" }).eq("id", orderId);

    // Get order items to restore stock
    const { data: order } = await supabase
      .from("orders")
      .select("order_items(*)")
      .eq("id", orderId)
      .single();

    if (order) {
      for (const item of order.order_items) {
        if (item.product_name === productName) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock: product.stock + qty })
              .eq("id", item.product_id);

            await supabase.from("inventory_movements").insert({
              product_id: item.product_id,
              qty_change: qty,
              reason: "مرتجع",
              reference_id: retId,
            });
          }
        }
      }
    }

    // Log activity
    await supabase.from("activity_log").insert({
      action: "مرتجع جديد",
      details: `مرتجع #${retId} — ${productName} × ${qty} — السبب: ${reason}`,
      actor: "الإدارة",
    });

    return new Response(JSON.stringify({ returnId: retId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
