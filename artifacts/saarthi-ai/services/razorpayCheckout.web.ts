// Web checkout via Razorpay's hosted checkout.js (no native module on web).
import type {
  RazorpayCheckoutInput,
  RazorpayCheckoutResult,
} from "./razorpayCheckout.types";

export type { RazorpayCheckoutInput, RazorpayCheckoutResult };

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayWebInstance = {
  open: () => void;
  on: (event: string, cb: (response: unknown) => void) => void;
};
type RazorpayWebCtor = new (options: Record<string, unknown>) => RazorpayWebInstance;

let scriptPromise: Promise<RazorpayWebCtor> | null = null;

function loadScript(): Promise<RazorpayWebCtor> {
  const existing = (window as unknown as { Razorpay?: RazorpayWebCtor }).Razorpay;
  if (existing) return Promise.resolve(existing);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const ctor = (window as unknown as { Razorpay?: RazorpayWebCtor }).Razorpay;
      if (ctor) resolve(ctor);
      else reject(new Error("RAZORPAY_SCRIPT_INVALID"));
    };
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("RAZORPAY_SCRIPT_LOAD_FAILED"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(
  input: RazorpayCheckoutInput,
): Promise<RazorpayCheckoutResult> {
  let Razorpay: RazorpayWebCtor;
  try {
    Razorpay = await loadScript();
  } catch {
    return { kind: "failed", message: "Could not load Razorpay checkout." };
  }

  return new Promise((resolve) => {
    let settled = false;
    let lastFailure: string | null = null;
    const finish = (result: RazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const rzp = new Razorpay({
      key: input.keyId,
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      name: "Sartva",
      description: input.description,
      prefill: input.prefill,
      theme: input.themeColor ? { color: input.themeColor } : undefined,
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) =>
        finish({
          kind: "success",
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      modal: {
        // Razorpay keeps the modal open after a failed attempt so the user can
        // retry; we report the failure only once they close it.
        ondismiss: () =>
          finish(
            lastFailure !== null
              ? { kind: "failed", message: lastFailure }
              : { kind: "cancelled" },
          ),
      },
    });
    rzp.on("payment.failed", (response) => {
      const description = (response as { error?: { description?: string } })
        ?.error?.description;
      lastFailure = typeof description === "string" ? description : "";
    });
    rzp.open();
  });
}
