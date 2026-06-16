# MindfulWill Nutrition Planner

A hosted meal planning tool from MindfulWill.

The planner estimates daily calories and macros, builds a 7-day meal plan, creates a grocery list, supports meal swaps, and exports the finished plan as PDF, TXT, or CSV.

## Product Model

This version is intended to be hosted on Netlify and sold through Gumroad.

Buyer flow:

1. Customer purchases the product on Gumroad.
2. Gumroad provides the hosted app URL and license key.
3. Customer opens the app on desktop or mobile.
4. Customer enters the license key once.
5. The browser remembers access on that device.

## Netlify Setup

Connect this GitHub repo to Netlify.

Build settings:

- Build command: leave blank
- Publish directory: `.`
- Functions directory: `netlify/functions`

Environment variables:

- `GUMROAD_PRODUCT_PERMALINK` - the Gumroad product permalink used for license verification

The app calls `/.netlify/functions/verify-license`, and that function verifies the buyer's code with Gumroad.

## Local Testing

Open `index.html` in a browser to preview the planner UI.

For development access, enter:

```text
PREVIEW
```

Real Gumroad license verification requires the Netlify Function to be running with `GUMROAD_PRODUCT_PERMALINK` configured.

## Important Health Note

This product provides general nutrition estimates for planning and education. It is not medical advice and is not a substitute for a doctor, registered dietitian, or licensed healthcare professional.
