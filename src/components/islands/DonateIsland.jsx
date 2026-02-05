import { useMemo, useRef, useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";

const donationTiers = [50, 100, 250, 500];

const programOptions = [
  { value: "general", label: "General Fund" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health & Healing" },
  { value: "agriculture", label: "Agriculture" },
  { value: "pastor-training", label: "Pastor Training" },
];

function formatUSD(n) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n}`;
  }
}

export default function DonateIsland() {
  const donateCardRef = useRef(null);

  const [selectedAmount, setSelectedAmount] = useState(50);
  const [isMonthly, setIsMonthly] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [program, setProgram] = useState("general");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const amountToDonate = useMemo(() => {
    const n = Number(customAmount);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const impactLine = useMemo(() => {
    if (amountToDonate >= 500) return "Helps strengthen long-term programs and expand outreach.";
    if (amountToDonate >= 250) return "Can support supplies, training, and community projects on the ground.";
    if (amountToDonate >= 100) return "Can help fund education materials, basic care, and practical support.";
    return "Can help provide essential items and resources for families in need.";
  }, [amountToDonate]);

  const tierImpact = useMemo(
    () => [
      { amount: 50, text: "Supports essential supplies and immediate needs." },
      { amount: 100, text: "Helps provide education materials and basic care support." },
      { amount: 250, text: "Supports training, outreach, and community resources." },
      { amount: 500, text: "Helps expand programs and build long-term stability." },
    ],
    []
  );

  const stripePromise = useMemo(() => {
    const pk =
      import.meta.env.PUBLIC_STRIPE_PUBLIC_KEY
    if (!pk) return null;
    return loadStripe(pk);
  }, []);

  const isMobileViewport = () => {
    // Matches Tailwind's "lg" breakpoint (1024px). You can change this if you want.
    return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  };

  const scrollToDonateCardIfMobile = () => {
    if (!isMobileViewport()) return;
    const el = donateCardRef.current;
    if (!el) return;

    // Scroll just enough to put the donate card in view, not the hero.
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Optional: slight offset if you have a sticky navbar
    // (uncomment and tweak the offset if needed)
    // setTimeout(() => {
    //   window.scrollBy({ top: -96, left: 0, behavior: "instant" });
    // }, 250);
  };

  const handleDonate = async () => {
  setErrorMsg("");
  setIsLoading(true);

  try {
    const payload = { amount: amountToDonate, isMonthly };

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

    if (!data?.url) {
      throw new Error("No Checkout URL returned from server.");
    }

    // ✅ Stripe-approved replacement for redirectToCheckout
    window.location.assign(data.url);
  } catch (err) {
    setErrorMsg(err?.message || "Donation request failed.");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <section className="bg-white pt-28 pb-20 px-6 md:px-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left: Main donate card */}
          <div className="lg:col-span-7">
            <div
              ref={donateCardRef}
              className="rounded-2xl border border-green-100 bg-white shadow-sm p-6 md:p-8"
            >
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-green-900">
                  Give Hope. Change Lives.
                </h1>
                <p className="mt-3 text-lg text-green-800">
                  Your generosity helps bring healthcare, education, sustainable agriculture,
                  and spiritual support to communities across Tanzania.
                </p>

                <div className="mt-5 inline-flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-900">
                    501(c)(3) nonprofit
                  </span>
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-900">
                    Secure checkout via Stripe
                  </span>
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-900">
                    Tax-deductible as allowed by law
                  </span>
                </div>
              </div>

              {/* Program selector */}
              <div className="mt-8">
                <label
                  htmlFor="program"
                  className="block text-sm font-semibold text-green-900 mb-2"
                >
                  Designate your gift
                </label>
                <select
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                >
                  {programOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-green-700">
                  Choose where you’d like your donation to have the greatest impact.
                </p>
              </div>

              {/* Amount selection */}
              <div className="mt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-green-900">Choose an amount</h2>
                    <p className="text-sm text-green-700">
                      Select a tier or enter a custom amount.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-green-700">Selected</p>
                    <p className="text-2xl font-extrabold text-green-900">
                      {formatUSD(amountToDonate)}
                      {isMonthly ? <span className="text-sm font-bold"> / month</span> : null}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {donationTiers.map((tier) => {
                    const active = amountToDonate === tier && !customAmount;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(tier);
                          setCustomAmount("");
                        }}
                        className={`rounded-xl border px-4 py-3 text-lg font-extrabold transition ${
                          active
                            ? "bg-[#e01b24] text-white border-[#e01b24]"
                            : "bg-white text-green-900 border-green-200 hover:bg-green-50"
                        }`}
                        aria-pressed={active}
                      >
                        ${tier}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <label className="sr-only" htmlFor="customAmount">
                    Custom donation amount
                  </label>
                  <div className="relative max-w-sm mx-auto md:mx-0">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800 font-semibold">
                      $
                    </span>
                    <input
                      id="customAmount"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="Enter custom amount"
                      className="w-full rounded-xl border border-green-200 bg-white pl-10 pr-4 py-3 text-green-900 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/30"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-start justify-center md:justify-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <input
                    type="checkbox"
                    id="monthly"
                    checked={isMonthly}
                    onChange={() => setIsMonthly((v) => !v)}
                    className="mt-1 w-5 h-5 accent-[#e01b24]"
                  />
                  <div className="text-left">
                    <label htmlFor="monthly" className="text-green-900 font-semibold">
                      Make this a monthly donation
                    </label>
                    <p className="text-sm text-green-700">
                      Monthly giving helps us plan long-term programs and respond quickly to urgent needs.
                    </p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleDonate}
                  disabled={isLoading}
                  className={`w-full rounded-xl bg-[#e01b24] px-8 py-4 text-lg font-extrabold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-[#e01b24]/40 focus:ring-offset-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading
                    ? "Redirecting to secure checkout..."
                    : `Donate ${formatUSD(amountToDonate)}${isMonthly ? " / month" : ""}`}
                </button>

                <p className="mt-3 text-xs text-green-700 text-center">
                  You’ll complete your donation securely on Stripe. We never store card details.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-green-100 bg-white p-5 text-left">
                <h3 className="text-sm font-extrabold text-green-900 uppercase tracking-wide">
                  Your impact
                </h3>
                <p className="mt-2 text-green-800">{impactLine}</p>
              </div>

              <div className="mt-8 text-green-700 italic text-center md:text-left">
                “Every dollar you give helps bring dignity and healing to families who have gone without.
                Your gift makes a difference.” – Pastor Daniel, Outreach Leader
              </div>
            </div>
          </div>

          {/* Right: Impact sidebar */}
          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-green-100 bg-green-50 shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-extrabold text-green-900 text-center">
                What your gift can help support
              </h2>
              <p className="mt-3 text-green-800 text-center">
                Real needs, real people, and lasting work on the ground in Tanzania.
              </p>

              <div className="mt-6 space-y-3">
                {tierImpact.map((t) => (
                  <div
                    key={t.amount}
                    className="flex items-start justify-between gap-4 rounded-xl bg-white border border-green-100 p-4"
                  >
                    <div>
                      <p className="font-extrabold text-green-900">{formatUSD(t.amount)}</p>
                      <p className="text-sm text-green-700 mt-1">{t.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAmount(t.amount);
                        setCustomAmount("");
                        scrollToDonateCardIfMobile(); // ✅ mobile only, scroll to card
                      }}
                      className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-900 hover:bg-green-50"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-green-200 bg-white p-5">
                <h3 className="text-lg font-extrabold text-green-900">Giving with confidence</h3>
                <ul className="mt-3 space-y-2 text-sm text-green-800">
                  <li className="flex gap-2">
                    <span className="mt-0.5">✅</span>
                    <span>Registered 501(c)(3) nonprofit organization</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">✅</span>
                    <span>Donations are tax-deductible as allowed by law</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">✅</span>
                    <span>Secure payments processed by Stripe</span>
                  </li>
                </ul>

                <p className="mt-4 text-xs text-green-700">
                  Have questions about giving or sponsorship?{" "}
                  <a href="/contact" className="underline font-semibold hover:opacity-80">
                    Contact us
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
