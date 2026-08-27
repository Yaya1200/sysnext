import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === "admin" ? "admin" : "user";

    if (!fullName || !email || password.length < 6) {
      return NextResponse.json({ error: "Full name, valid email, and a password of at least 6 characters are required." }, { status: 400 });
    }

    if (role === "admin" && body.adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
      return NextResponse.json({ error: "A valid administrator registration code is required." }, { status: 403 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: "Administrator registration is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server environment." }, { status: 503 });
    }

    if (!serviceKey.startsWith("eyJ")) {
      return NextResponse.json({ error: "Administrator registration needs the real Supabase service_role key, not a placeholder value." }, { status: 503 });
    }

    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: false, user_metadata: { full_name: fullName } });
    if (error || !data.user) return NextResponse.json({ error: error?.message || "Unable to create account." }, { status: 400 });

    const { error: profileError } = await supabase.from("profiles").update({ full_name: fullName, role }).eq("id", data.user.id);
    if (profileError) return NextResponse.json({ error: "Account created, but its role could not be saved." }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid registration request." }, { status: 400 });
  }
}
