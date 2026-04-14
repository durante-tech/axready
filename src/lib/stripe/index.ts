import Stripe from "stripe";

let _stripe: Stripe | null = null;

const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        typescript: true,
      });
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { stripe };
