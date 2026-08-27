"use client";

import { FormEvent, useEffect, useState } from "react";

export default function ContactPage() {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaQuestion, setCaptchaQuestion] = useState("Loading CAPTCHA...");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaAnswer, setCaptchaAnswer] = useState("");

    useEffect(() => {
      fetch("/api/captcha")
        .then((response) => response.json())
        .then((captcha) => { setCaptchaQuestion(captcha.question); setCaptchaToken(captcha.token); })
        .catch(() => setCaptchaQuestion("CAPTCHA unavailable. Refresh the page."));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setIsSubmitting(true);
      setMessage("");

      const form = event.currentTarget;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), captchaToken, captchaAnswer }),
      });
      const result = await response.json();
      setIsSubmitting(false);

      if (!response.ok) {
        setMessage(result.error ?? "Unable to send your message.");
        return;
      }

      form.reset();
      setMessage("Thanks. Your message has been sent.");
    }

    return (
      <div className="bg-gray-100">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
            <div className="lg:flex lg:justify-center">
              <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
                    <input required type="text" id="name" name="name" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                    <input required type="email" id="email" name="email" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">Phone</label>
                    <input type="tel" id="phone" name="phone" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 font-bold mb-2">Subject</label>
                    <input required type="text" id="subject" name="subject" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
                    <textarea required id="message" name="message" rows={5} className="w-full px-3 py-2 border rounded-lg"></textarea>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="captcha" className="block text-gray-700 font-bold mb-2">CAPTCHA: {captchaQuestion}</label>
                    <input required id="captcha" name="captcha" inputMode="numeric" value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="text-center">
                    <button disabled={isSubmitting} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 disabled:opacity-60">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                  {message ? <p className="mt-4 text-center text-sm text-gray-700">{message}</p> : null}
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }