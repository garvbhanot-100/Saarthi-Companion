import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { prisma } from "@workspace/db";
import { loadUserState, planFromExpiry, type UserStateDto } from "./saarthiStore";

/**
 * Razorpay integration — TEST MODE ONLY.
 *
 * Secrets are read from the environment (artifacts/api-server/.env locally).
 * They are never logged, returned to clients, or sent anywhere except to
 * Razorpay's API by the official SDK.
 *
 * Google Play: selling digital content inside an Android app distributed on
 * Google Play with a non-Play billing system requires enrolment in Google
 * Play's user-choice / alternative billing programme for India, offering Play
 * Billing alongside, and reporting external transactions to Google. That is
 * not implemented here, so this checkout must not ship in a Play release build.
 */

export const PREMIUM_AMOUNT_PAISE = 149 * 100;
export const PREMIUM_CURRENCY = "INR";
export const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export class PaymentError extends Error {
  constructor(
    public readonly code: string,
    public readonly status = 400,
  ) {
    super(code);
  }
}

function keyId() {
  return process.env.RAZORPAY_KEY_ID?.trim() || "";
}

function keySecret() {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || "";
}

function webhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";
}

/** Throws unless Test Mode keys are configured. Live keys are refused. */
function requireTestModeConfig() {
  const id = keyId();
  if (!id || !keySecret()) {
    throw new PaymentError("PAYMENTS_NOT_CONFIGURED", 503);
  }
  if (!id.startsWith("rzp_test_")) {
    throw new PaymentError("LIVE_MODE_NOT_ALLOWED", 503);
  }
  return id;
}

let client: Razorpay | null = null;
let clientKeyId = "";

function razorpayClient() {
  const id = requireTestModeConfig();
  if (!client || clientKeyId !== id) {
    client = new Razorpay({ key_id: id, key_secret: keySecret() });
    clientKeyId = id;
  }
  return client;
}

function hmacHex(secret: string, payload: string | Buffer) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqualHex(expected: string, received: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isCheckoutSignatureValid(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const secret = keySecret();
  if (!secret || !orderId || !paymentId || !signature) return false;
  return safeEqualHex(hmacHex(secret, `${orderId}|${paymentId}`), signature);
}

export function isWebhookConfigured() {
  return Boolean(webhookSecret());
}

export function isWebhookSignatureValid(rawBody: Buffer, signature: string) {
  const secret = webhookSecret();
  if (!secret || !signature) return false;
  return safeEqualHex(hmacHex(secret, rawBody), signature);
}

export type CreatedOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export async function createPremiumOrder(userId: string): Promise<CreatedOrder> {
  const id = requireTestModeConfig();

  const user = await prisma.saarthiUser.findUnique({
    where: { id: userId },
    select: { premiumExpiresAt: true },
  });
  if (!user) throw new PaymentError("NOT_FOUND", 404);
  if (planFromExpiry(user.premiumExpiresAt) === "premium") {
    throw new PaymentError("ALREADY_PREMIUM", 409);
  }

  const order = await razorpayClient().orders.create({
    amount: PREMIUM_AMOUNT_PAISE,
    currency: PREMIUM_CURRENCY,
    receipt: `prem_${Date.now().toString(36)}_${userId.slice(0, 8)}`,
    notes: { userId, product: "premium_30d" },
  });

  await prisma.saarthiPayment.create({
    data: {
      userId,
      orderId: order.id,
      amount: PREMIUM_AMOUNT_PAISE,
      currency: PREMIUM_CURRENCY,
      status: "created",
    },
  });

  return {
    orderId: order.id,
    amount: PREMIUM_AMOUNT_PAISE,
    currency: PREMIUM_CURRENCY,
    keyId: id,
  };
}

type ActivationResult = { userId: string; alreadyProcessed: boolean };

/**
 * Marks the order paid and extends Premium by exactly 30 days, once.
 * Safe against the client-verify call and the webhook racing each other:
 * only the transaction that flips status to "paid" grants the days.
 */
async function activatePremiumForOrder(input: {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  method?: string | null;
  verifiedVia: "client_verify" | "webhook";
}): Promise<ActivationResult> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.saarthiPayment.findUnique({
      where: { orderId: input.orderId },
    });
    if (!row) throw new PaymentError("ORDER_NOT_FOUND", 404);
    if (row.status === "paid") {
      return { userId: row.userId, alreadyProcessed: true };
    }
    if (input.amount !== row.amount || input.currency !== row.currency) {
      throw new PaymentError("AMOUNT_MISMATCH");
    }

    const now = new Date();
    const claimed = await tx.saarthiPayment.updateMany({
      where: { orderId: input.orderId, status: { not: "paid" } },
      data: {
        status: "paid",
        paymentId: input.paymentId,
        method: input.method ?? null,
        verifiedVia: input.verifiedVia,
        failureReason: null,
        paidAt: now,
      },
    });
    if (claimed.count === 0) {
      return { userId: row.userId, alreadyProcessed: true };
    }

    // Lock the user row so two different paid orders can't both read the old expiry.
    const locked = await tx.$queryRaw<{ premium_expires_at: Date | null }[]>`
      SELECT premium_expires_at FROM saarthi_users WHERE id = ${row.userId}::uuid FOR UPDATE`;
    const current = locked[0]?.premium_expires_at ?? null;
    const base =
      current && current.getTime() > now.getTime() ? current : now;
    const expiresAt = new Date(base.getTime() + PREMIUM_DURATION_MS);

    await tx.saarthiUser.update({
      where: { id: row.userId },
      data: { premiumExpiresAt: expiresAt, plan: "premium" },
    });
    await tx.saarthiPayment.update({
      where: { orderId: input.orderId },
      data: { premiumExpiresAt: expiresAt },
    });
    return { userId: row.userId, alreadyProcessed: false };
  });
}

/**
 * Called by the app after Razorpay checkout reports success. The client's
 * claim is not trusted: the signature is checked with the key secret, and the
 * payment is fetched from Razorpay to confirm order, amount and capture.
 */
export async function verifyCheckoutPayment(
  userId: string,
  body: { orderId: string; paymentId: string; signature: string },
): Promise<{ state: UserStateDto; alreadyProcessed: boolean }> {
  requireTestModeConfig();
  const { orderId, paymentId, signature } = body;

  const row = await prisma.saarthiPayment.findUnique({ where: { orderId } });
  if (!row || row.userId !== userId) {
    throw new PaymentError("ORDER_NOT_FOUND", 404);
  }

  if (!isCheckoutSignatureValid(orderId, paymentId, signature)) {
    throw new PaymentError("INVALID_SIGNATURE");
  }

  let alreadyProcessed = row.status === "paid";
  if (!alreadyProcessed) {
    let payment = await razorpayClient().payments.fetch(paymentId);
    if (payment.order_id !== orderId) {
      throw new PaymentError("ORDER_MISMATCH");
    }
    if (payment.status === "authorized") {
      payment = await razorpayClient().payments.capture(
        paymentId,
        row.amount,
        row.currency,
      );
    }
    if (payment.status !== "captured") {
      throw new PaymentError("PAYMENT_NOT_CAPTURED");
    }
    const result = await activatePremiumForOrder({
      orderId,
      paymentId,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      verifiedVia: "client_verify",
    });
    alreadyProcessed = result.alreadyProcessed;
  }

  const state = await loadUserState(userId);
  if (!state) throw new PaymentError("NOT_FOUND", 404);
  return { state, alreadyProcessed };
}

export async function getOrderStatus(userId: string, orderId: string) {
  const row = await prisma.saarthiPayment.findUnique({ where: { orderId } });
  if (!row || row.userId !== userId) {
    throw new PaymentError("ORDER_NOT_FOUND", 404);
  }
  return row.status as "created" | "paid" | "failed";
}

type WebhookPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  error_description?: string | null;
  error_reason?: string | null;
};

/**
 * Handles a webhook whose signature has ALREADY been verified.
 * Returns a short label for logging.
 */
export async function handleVerifiedWebhook(event: {
  event?: string;
  payload?: { payment?: { entity?: WebhookPaymentEntity } };
}): Promise<string> {
  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;
  if (!entity || !orderId || !paymentId) return "ignored:no_payment";

  const row = await prisma.saarthiPayment.findUnique({ where: { orderId } });
  if (!row) return "ignored:unknown_order";

  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      if (entity.status !== "captured") return "ignored:not_captured";
      const result = await activatePremiumForOrder({
        orderId,
        paymentId,
        amount: Number(entity.amount),
        currency: String(entity.currency),
        method: entity.method,
        verifiedVia: "webhook",
      });
      return result.alreadyProcessed ? "duplicate" : "activated";
    }
    case "payment.failed": {
      await prisma.saarthiPayment.updateMany({
        where: { orderId, status: "created" },
        data: {
          status: "failed",
          paymentId,
          failureReason:
            entity.error_reason || entity.error_description || "failed",
        },
      });
      return "marked_failed";
    }
    default:
      return "ignored:event";
  }
}
