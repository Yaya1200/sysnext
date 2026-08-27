import { createClient } from "../../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let name = "SysNet Administrator";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
    name = profile?.full_name || user.email || "Administrator";
  }

  return <AdminDashboard name={name} />;
}
