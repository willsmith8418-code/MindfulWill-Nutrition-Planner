const FALLBACK_PRODUCT_ID = "7_7U-dRffdjG8hER_fNvMg==";

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { valid: false, message: "Method not allowed." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { valid: false, message: "Invalid request." });
  }

  const licenseKey = String(body.licenseKey || "").trim();
  const productIds = getProductIds();

  if (!licenseKey) {
    return json(400, { valid: false, message: "Enter your access code." });
  }

  if (!productIds.length) {
    return json(500, {
      valid: false,
      message: "License verification is not configured yet."
    });
  }

  try {
    const failures = [];

    for (const productId of productIds) {
      const form = new URLSearchParams({
        product_id: productId,
        license_key: licenseKey
      });

      const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString()
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        failures.push({
          product: productId,
          status: response.status,
          message: result.message || result.error || "Gumroad did not accept this code."
        });
        continue;
      }

      if (result.purchase && result.purchase.refunded) {
        return json(200, {
          valid: false,
          message: "This purchase has been refunded, so access is no longer active."
        });
      }

      if (result.purchase && result.purchase.chargebacked) {
        return json(200, {
          valid: false,
          message: "This purchase is not currently eligible for access."
        });
      }

      return json(200, { valid: true });
    }

    const reason = failures.map(f => f.message).filter(Boolean).join(" | ");
    return json(200, {
      valid: false,
      message: reason || "That code was not accepted. Check your Gumroad license key and try again."
    });
  } catch (error) {
    return json(502, {
      valid: false,
      message: "Could not verify the code right now. Try again in a minute."
    });
  }
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}

function getProductIds() {
  const configured = [
    process.env.GUMROAD_PRODUCT_ID,
    process.env.GUMROAD_PRODUCT_IDS
  ]
    .filter(Boolean)
    .flatMap(value => String(value).split(","))
    .map(value => value.trim())
    .filter(Boolean)
    .flatMap(value => value.includes("=") ? [value, value.split("=").pop().trim()] : [value]);

  return [...new Set([
    ...configured,
    FALLBACK_PRODUCT_ID
  ].filter(Boolean))];
}
