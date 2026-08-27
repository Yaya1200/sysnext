import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { verifyCaptcha } from "../captcha/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Name, email, subject, and message are required." }, { status: 400 });
    }

    if (!verifyCaptcha(body.captchaToken, body.captchaAnswer)) {
      return NextResponse.json({ error: "Please solve the CAPTCHA correctly." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({ name, email, phone, subject, message });

    if (error) {
      console.error("Contact message insert failed", error);
      return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
