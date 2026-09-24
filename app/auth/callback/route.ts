import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Supabase did not provide a confirmation code
  if (!code) {
    console.error("Auth callback error: Missing confirmation code");

    return NextResponse.redirect(
      new URL(
        "/login?error=missing_confirmation_code",
        requestUrl.origin
      )
    );
  }

  try {
    const supabase = await createClient();

    // Exchange the email confirmation code for a Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(
        "Auth callback exchangeCodeForSession error:",
        error.message
      );

      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    console.log("Auth callback: Email confirmed successfully");

    // Send the user to the login page
    return NextResponse.redirect(
      new URL(
        "/login?confirmed=true",
        requestUrl.origin
      )
    );
  } catch (error) {
    console.error("Auth callback unexpected error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected authentication error";

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin
      )
    );
  }
}