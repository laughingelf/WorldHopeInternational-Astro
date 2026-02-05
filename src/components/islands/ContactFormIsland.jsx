import React, { useMemo, useState } from "react";

export default function ContactForm() {
  const [topic, setTopic] = useState("general");
  const [otherTopic, setOtherTopic] = useState("");

  const showOther = topic === "other";
  const finalTopic = useMemo(() => (showOther ? otherTopic.trim() : topic), [showOther, otherTopic, topic]);

  return (
    <section className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-12 items-start">
        {/* LEFT: Copy + trust */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 md:p-8 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-900">
              Contact Word Hope International
            </h2>

            <p className="mt-3 text-green-800 leading-relaxed">
              Have a question about our programs, giving, sponsorship, or a mission trip? Send us a message and we’ll get back to you.
            </p>

            <div className="mt-6 space-y-3 text-sm text-green-800">
              <div className="flex gap-2">
                <span className="mt-0.5">✅</span>
                <span>We typically respond within 1–2 business days.</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-0.5">✅</span>
                <span>Your information stays private and is never sold.</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-0.5">✅</span>
                <span>If you’re reaching out about donating, include your preferred way to follow up.</span>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-green-200 bg-white p-5">
              <p className="text-sm font-semibold text-green-900">Direct contact</p>
              <p className="mt-2 text-sm text-green-800">
                Email:{" "}
                <a
                  className="underline font-semibold hover:opacity-80"
                  href="mailto:wordhopeint@gmail.com"
                >
                  wordhopeint@gmail.com
                </a>
              </p>
              <p className="mt-1 text-sm text-green-800">
                Phone:{" "}
                <a className="underline font-semibold hover:opacity-80" href="tel:+18175048915">
                  +1 (817) 504-8915
                </a>
              </p>

              <p className="mt-4 text-xs text-green-700">
                If this is time-sensitive, email is usually the fastest way to reach us.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-green-100 bg-white p-6 md:p-8 shadow-sm">
            <h3 className="text-xl md:text-2xl font-extrabold text-green-900 text-center md:text-left">
              Send a message
            </h3>
            <p className="mt-2 text-green-700 text-center md:text-left">
              Fill this out and we’ll follow up as soon as we can.
            </p>

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              action="/contact/success"
              className="mt-8 grid gap-6"
            >
              {/* Netlify required hidden input */}
              <input type="hidden" name="form-name" value="contact" />
              {/* Honeypot */}
              <p className="hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" />
                </label>
              </p>
              <form name="contact" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
                <input type="hidden" name="form-name" value="contact" />
                <input name="bot-field" />
                <input name="topic" />
                <input name="topic_final" />
                <input name="otherTopic" />
                <input name="name" />
                <input name="email" />
                <input name="phone" />
                <input name="preferredContact" />
                <textarea name="message"></textarea>
              </form>


              {/* Topic */}
              <div>
                <label className="block text-green-900 font-semibold mb-2" htmlFor="topic">
                  What can we help with?
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                >
                  <option value="general">General question</option>
                  <option value="donation">Donation / Receipt</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="mission-trip">Mission trip</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="programs">Programs</option>
                  <option value="other">Other</option>
                </select>
                {/* Store the final topic in a hidden field so Netlify gets it clean */}
                <input type="hidden" name="topic_final" value={finalTopic} />
              </div>

              {showOther && (
                <div>
                  <label className="block text-green-900 font-semibold mb-2" htmlFor="otherTopic">
                    Brief topic
                  </label>
                  <input
                    id="otherTopic"
                    name="otherTopic"
                    type="text"
                    placeholder="Example: Speaking request"
                    value={otherTopic}
                    onChange={(e) => setOtherTopic(e.target.value)}
                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                  />
                </div>
              )}

              {/* Name + Email */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-green-900 font-semibold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-green-900 font-semibold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {/* Optional phone */}
              <div>
                <label className="block text-green-900 font-semibold mb-2" htmlFor="phone">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                  placeholder="(###) ###-####"
                />
                <p className="mt-2 text-xs text-green-700">
                  If you prefer a call or text follow-up, leave a number here.
                </p>
              </div>

              {/* Preferred contact method */}
              <fieldset className="rounded-xl border border-green-100 bg-green-50 p-4">
                <legend className="px-2 text-sm font-semibold text-green-900">
                  Preferred follow-up
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-green-900">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      defaultChecked
                      className="accent-[#e01b24]"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-green-900">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="call"
                      className="accent-[#e01b24]"
                    />
                    Call
                  </label>
                  <label className="flex items-center gap-2 text-green-900">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="text"
                      className="accent-[#e01b24]"
                    />
                    Text
                  </label>
                </div>
              </fieldset>

              {/* Message */}
              <div>
                <label className="block text-green-900 font-semibold mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={6}
                  required
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                  placeholder="How can we help?"
                />
                <p className="mt-2 text-xs text-green-700">
                  If you’re asking about a donation receipt, include the email you used at checkout and the approximate date.
                </p>
              </div>

              {/* Submit */}
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#e01b24] hover:bg-red-800 text-white px-8 py-4 text-lg font-extrabold transition focus:outline-none focus:ring-2 focus:ring-[#e01b24]/40 focus:ring-offset-2 active:scale-[0.99]"
                >
                  Send Message
                </button>
                <p className="text-center text-xs text-green-700">
                  By submitting, you agree to be contacted about your message. No spam, ever.
                </p>
              </div>
            </form>
          </div>

          {/* small reassurance bar */}
          <div className="mt-6 rounded-2xl border border-green-100 bg-white p-5 text-sm text-green-800 shadow-sm">
            <p className="font-semibold text-green-900 mb-1">Quick note</p>
            <p>
              If you’re trying to donate and something isn’t working, include what device you’re on (phone or desktop) and we’ll help you troubleshoot quickly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
