import { createHmac, randomInt } from "crypto";
import { NextResponse } from "next/server";

function secret() {
  return process.env.CAPTCHA_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "local-development-captcha-secret";
}

export async function GET() {
  const first = randomInt(2, 10);
  const second = randomInt(2, 10);
  const answer = first + second;
  const payload = `${first}:${second}:${answer}:${Date.now()}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return NextResponse.json({ question: `What is ${first} + ${second}?`, token: `${payload}.${signature}` });
}

export function verifyCaptcha(token: unknown, answer: unknown) {
  if (typeof token !== "string" || typeof answer !== "string") return false;
  const [first, second, expected, issuedAt, signature] = token.split(":").flatMap((part) => part.split("."));
  if (!first || !second || !expected || !issuedAt || !signature) return false;
  if (Date.now() - Number(issuedAt) > 10 * 60 * 1000) return false;
  const payload = `${first}:${second}:${expected}:${issuedAt}`;
  const calculated = createHmac("sha256", secret()).update(payload).digest("hex");
  return calculated === signature && Number(answer) === Number(expected);
}
