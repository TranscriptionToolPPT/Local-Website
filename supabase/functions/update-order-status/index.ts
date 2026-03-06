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

    const { orderId, status } = await req.json();

    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (orderError) throw orderError;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (updateError) throw updateError;

    // If delivered, deduct stock atomically
    if (status === "delivered") {
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock, sales")
          .eq("id", item.product_id)
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({
              stock: Math.max(0, product.stock - item.qty),
              sales: product.sales + item.qty,
            })
            .eq("id", item.product_id);

          // Record inventory movement
          await supabase.from("inventory_movements").insert({
            product_id: item.product_id,
            qty_change: -item.qty,
            reason: "بيع",
            reference_id: orderId,
          });
        }
      }
    }

    // Log activity
    await supabase.from("activity_log").insert({
      action: "تحديث حالة طلب",
      details: `تم تحديث طلب #${orderId} إلى "${status}"`,
      actor: "الإدارة",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
