import OrderManageClient from "./OrderManageClient";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderManagePage() {
  const supabase = createServerSupabase();

  const { data: row } = await supabase
    .from("fanaha_order_settings")
    .select("value")
    .eq("key", "next_opening")
    .single();

  return <OrderManageClient initialNextOpening={row?.value || ""} />;
}
