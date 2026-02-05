const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function getBaseUrl(event) {
  const envUrl =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;

  if (envUrl) return envUrl;

  const host =
    event.headers["x-forwarded-host"] ||
    event.headers.host ||
    "localhost:4321";

  const proto = event.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}`;
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { Allow: "POST" }, body: "Method Not Allowed" };
    }

    const { amount, isMonthly } = JSON.parse(event.body || "{}");
    const amountNum = Number(amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid donation amount." }),
      };
    }

    const safeAmount = Math.round(amountNum);
    if (safeAmount < 1 || safeAmount > 100000) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Donation amount out of range." }),
      };
    }

    const baseUrl = getBaseUrl(event);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isMonthly ? "Monthly Donation to Word Hope International" : "Donation to Word Hope International",
            },
            unit_amount: safeAmount * 100,
            // NOTE: if you truly want monthly recurring, you'll need mode: "subscription" + a Price ID.
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/donate/success`,
      cancel_url: `${baseUrl}/donate/cancel`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err.message || err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message || "Stripe error" }),
    };
  }
};
