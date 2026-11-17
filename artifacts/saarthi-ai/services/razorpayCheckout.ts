// Native (Android / iOS) checkout. Requires a development or EAS build —
// react-native-razorpay is a native module and does not run in Expo Go.
// Web uses razorpayCheckout.web.ts instead (Metro picks it automatically).
import { Platform } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

import {
  looksCancelled,
  type RazorpayCheckoutInput,
  type RazorpayCheckoutResult,
} from "./razorpayCheckout.types";

export type { RazorpayCheckoutInput, RazorpayCheckoutResult };

// Android SDK: Checkout.PAYMENT_CANCELED === 0.
const ANDROID_CANCEL_CODE = 0;

export async function openRazorpayCheckout(
  input: RazorpayCheckoutInput,
): Promise<RazorpayCheckoutResult> {
  try {
    const data = await RazorpayCheckout.open({
      key: input.keyId,
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      name: "Sartva",
      description: input.description,
      prefill: input.prefill,
      theme: input.themeColor ? { color: input.themeColor } : undefined,
    });
    return {
      kind: "success",
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
    };
  } catch (error) {
    const err = (error ?? {}) as { code?: number; description?: string };
    if (
      looksCancelled(err.description) ||
      (Platform.OS === "android" && err.code === ANDROID_CANCEL_CODE)
    ) {
      return { kind: "cancelled" };
    }
    return {
      kind: "failed",
      message: typeof err.description === "string" ? err.description : "",
    };
  }
}
