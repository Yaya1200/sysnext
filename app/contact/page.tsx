"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [captchaQuestion, setCaptchaQuestion] = useState("Loading security question...");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch("/api/captcha");
      const data = await response.json();
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
      setCaptchaAnswer("");
    } catch {
      setCaptchaQuestion("What is 5 + 3?");
    }
  };

  useEffect(() => {
    fetchCaptcha();

    // Check if user is logged in to prefill
    async function checkUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        setName(session.user.user_metadata?.full_name || "");
      } else {
        const local = window.localStorage.getItem("sysnet-user-demo");
        if (local) {
          const parsed = JSON.parse(local);
          setEmail(parsed.email || "");
          setName(parsed.full_name || "");
        }
      }
    }
    checkUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          captchaToken,
          captchaAnswer,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage({
          text: result.error || "Unable to send your message. Please check the CAPTCHA and try again.",
          type: "error",
        });
        fetchCaptcha();
        setIsSubmitting(false);
        return;
      }

      setStatusMessage({
        text: "Thank you! Your message has been sent successfully. Our support team will review your inquiry and get back to you shortly.",
        type: "success",
      });

      setSubject("");
      setMessage("");
      setCaptchaAnswer("");
      fetchCaptcha();
    } catch {
      setStatusMessage({
        text: "Network error. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Get In Touch</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900 sm:text-5xl">
            Contact SysNet Technologies
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Have a question about our networking solutions, services, or hardware catalog? Reach out to our engineering and support specialists.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 max-w-6xl mx-auto">
          {/* Info Card */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-950 p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between">
            <div>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400">
                Headquarters
              </span>
              <h2 className="mt-4 text-2xl font-black text-white">SysNet Technologies PLC</h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Addis Ababa, Ethiopia • Providing comprehensive IT infrastructure, networking, and support solutions.
              </p>

              <div className="mt-8 space-y-5 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-blue-400 text-lg">
                    📞
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Phone Hotline</div>
                    <div className="font-semibold text-white">+251 (0) 911 04 67 05</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-blue-400 text-lg">
                    ✉️
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Email Support</div>
                    <div className="font-semibold text-white">info@sysnet.com.et</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-blue-400 text-lg">
                    🕒
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Working Hours</div>
                    <div className="font-semibold text-white">Mon - Sat: 8:30 AM - 5:30 PM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900 p-4 border border-slate-800 text-xs text-slate-400">
              <strong className="text-white block mb-1">🔐 Anti-Spam Security:</strong>
              This form is protected with cryptographic mathematical HMAC CAPTCHA tokens.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-3xl bg-white p-8 sm:p-10 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Send Us a Message</h3>

            {statusMessage && (
              <div
                className={`mb-6 rounded-2xl p-4 text-sm font-medium ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abel Samuel"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <input
                    required
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Enterprise Network Inquiry"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our technical team help your organization?"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* CAPTCHA Section */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="captcha" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🛡️ Security Verification:</span>
                    <span className="text-blue-600 font-black">{captchaQuestion}</span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    🔄 Refresh Question
                  </button>
                </div>

                <input
                  required
                  id="captcha"
                  name="captcha"
                  inputMode="numeric"
                  placeholder="Enter your answer (e.g. 12)"
                  value={captchaAnswer}
                  onChange={(event) => setCaptchaAnswer(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending Message..." : "Send Message →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}