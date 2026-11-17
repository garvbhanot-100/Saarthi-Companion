export type RazorpayCheckoutInput = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  prefill?: { name?: string; email?: string };
  themeColor?: string;
};

/**
 * Outcome reported by the checkout UI. "success" is only a claim from the
 * client: Premium is granted after the backend verifies the signature.
 */
export type RazorpayCheckoutResult =
  | {
      kind: "success";
      orderId: string;
      paymentId: string;
      signature: string;
    }
  | { kind: "cancelled" }
  | { kind: "failed"; message: string };

export function looksCancelled(description: unknown) {
  return typeof description === "string" && /cancel/i.test(description);
}
