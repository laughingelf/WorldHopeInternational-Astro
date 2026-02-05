import { useEffect, useMemo, useRef, useState } from "react";

const donationTiers = [50, 100, 250, 500];

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export default function DonateIsland() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [isMonthly, setIsMonthly] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const donateBoxRef = useRef(null);

  const amountToDonate = useMemo(() => {
    const n = Number(customAmount);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  // On mobile only: when selecting a tier, gently scroll the donate box into view (not the hero)
  const scrollDonateBoxIfMobile = () => {
    if (!isMobileViewport()) return;
    const el = donateBoxRef.current;
    if (!el) return;

    // small offset for sticky nav
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  const handleTierClick = (tier) => {
    setSelectedAmount(tier);
    setCustomAmount("");
    setErrorMsg("");
    // scroll after state updates hit layout
    requestAnimationFrame(() => scrollDonateBoxIfMobile());
  };

  const handleDonate = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const payload = {
        amount: amountToDonate,
        isMonthly,
      };

      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Server Error: ${res.status} - ${t}`);
      }

      const data = await res.json();

      // ✅ new flow: function returns session.url
      if (!data?.url) {
        throw new Error("No Checkout URL returned from server.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setErrorMsg(err?.message || "Donation request failed.");
      console.error("Donate error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional UX: clear tier highlight if user types a custom amount
  useEffect(() => {
    if (!customAmount) return;
    setErrorMsg("");
  }, [customAmount]);

  return (
    <section className="bg-white pt-28 pb-20 px-6 md:px-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Top copy */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Give Hope. Change Lives.
          </h1>
          <p className="text-lg text-green-800 mb-10">
            Through your support, we’re reaching communities across Tanzania with healthcare,
            education, agriculture, and the love of Christ.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* LEFT: Donate box */}
          <div ref={donateBoxRef} className="rounded-2xl border border-green-100 bg-white shadow-sm p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-green-900">
                  Choose an amount
                </h2>
                <p className="text-sm text-green-700 mt-1">
                  Select a tier or enter a custom amount.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-green-700">Total</p>
                <p className="text-2xl md:text-3xl font-extrabold text-green-900">
                  ${amountToDonate.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {donationTiers.map((tier) => {
                const active = !customAmount && amountToDonate === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierClick(tier)}
                    className={`rounded-xl px-4 py-3 text-lg font-semibold border transition ${
                      active
                        ? "bg-[#e01b24] text-white border-[#e01b24]"
                        : "bg-white text-green-900 border-green-200 hover:bg-green-50"
                    }`}
                  >
                    ${tier}
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <div className="mt-4">
              <label className="sr-only" htmlFor="customAmount">
                Custom donation amount
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-3 py-2">
                <span className="text-green-700 font-semibold">$</span>
                <input
                  id="customAmount"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="Enter custom amount"
                  className="w-full bg-transparent outline-none text-green-900 placeholder:text-green-500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Monthly toggle */}
            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMonthly}
                  onChange={() => setIsMonthly((v) => !v)}
                  className="mt-1 h-5 w-5 accent-[#e01b24]"
                />
                <div>
                  <p className="font-semibold text-green-900">Make this a monthly donation</p>
                  <p className="text-sm text-green-800">
                    Monthly giving helps us plan long-term programs and respond quickly to urgent needs.
                  </p>
                </div>
              </label>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Donate button */}
            <button
              type="button"
              onClick={handleDonate}
              disabled={isLoading}
              className={`mt-6 w-full rounded-xl bg-[#e01b24] px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/40 focus:ring-offset-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.99]"
              }`}
            >
              {isLoading ? "Redirecting..." : `Donate $${amountToDonate.toFixed(2)}${isMonthly ? " / month" : ""}`}
            </button>

            <p className="mt-3 text-center text-xs text-green-700">
              You’ll complete your donation securely on Stripe. We never store card details.
            </p>
          </div>

          {/* RIGHT: impact + reassurance */}
          <aside className="rounded-2xl border border-green-100 bg-green-50 p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold text-green-900 text-center">
              Your Impact
            </h3>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl bg-white border border-green-100 p-4">
                <p className="font-semibold text-green-900">Healthcare</p>
                <p className="text-sm text-green-800">
                  Helps provide medical outreach, supplies, and compassionate care in rural communities.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-green-100 p-4">
                <p className="font-semibold text-green-900">Education</p>
                <p className="text-sm text-green-800">
                  Supports Christ-centered education and leadership development for children and students.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-green-100 p-4">
                <p className="font-semibold text-green-900">Agriculture</p>
                <p className="text-sm text-green-800">
                  Fuels sustainable farming and hunger relief that strengthens families long-term.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-green-100 bg-white p-5 text-center">
              <p className="text-green-900 font-semibold">Prefer to talk first?</p>
              <p className="mt-1 text-sm text-green-800">
                Email{" "}
                <a href="mailto:wordhopeint@gmail.com" className="underline font-semibold hover:opacity-80">
                  wordhopeint@gmail.com
                </a>{" "}
                and we’ll help.
              </p>
            </div>
          </aside>
        </div>

        {/* Testimonial */}
        <div className="mt-14 max-w-3xl mx-auto text-center text-green-700 italic">
          “Every dollar you give helps bring dignity and healing to families who have gone without.
          Your gift makes a difference.”
          <div className="not-italic mt-2 text-sm text-green-800 font-semibold">
            Pastor Daniel, Outreach Leader
          </div>
        </div>
      </div>
    </section>
  );
}
