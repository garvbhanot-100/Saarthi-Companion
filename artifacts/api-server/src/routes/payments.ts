import express, { Router, type IRouter, type Response } from "express";
import {
  createPremiumOrder,
  getOrderStatus,
  handleVerifiedWebhook,
  isWebhookConfigured,
  isWebhookSignatureValid,
  PaymentError,
  verifyCheckoutPayment,
} from "../lib/razorpay";
import { requireUserId } from "./saarthi";

const router: IRouter = Router();

/** Raw body is required to verify the webhook signature; mounted in app.ts before express.json(). */
export const razorpayWebhookRawParser = express.raw({
  type: "*/*",
  limit: "1mb",
});

function sendPaymentError(res: Response, error: unknown) {
  if (error instanceof PaymentError) {
    res.status(error.status).json({ error: error.code });
    return;
  }
  res.log.error({ err: error }, "payment request failed");
  res.status(502).json({ error: "PAYMENT_PROVIDER_ERROR" });
}

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

router.post("/payments/razorpay/order", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  try {
    const order = await createPremiumOrder(auth.userId);
    res.log.info({ orderId: order.orderId }, "razorpay order created");
    res.json(order);
  } catch (error) {
    sendPaymentError(res, error);
  }
});

router.post("/payments/razorpay/verify", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const orderId = str(req.body?.orderId);
  const paymentId = str(req.body?.paymentId);
  const signature = str(req.body?.signature);
  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  try {
    const { state, alreadyProcessed } = await verifyCheckoutPayment(
      auth.userId,
      { orderId, paymentId, signature },
    );
    res.log.info({ orderId, paymentId, alreadyProcessed }, "razorpay verified");
    res.json({ sessionToken: auth.token, alreadyProcessed, ...state });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.log.warn({ orderId, code: error.code }, "razorpay verify rejected");
    }
    sendPaymentError(res, error);
  }
});

router.get("/payments/razorpay/order/:orderId/status", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  try {
    const status = await getOrderStatus(auth.userId, req.params.orderId);
    res.json({ status });
  } catch (error) {
    sendPaymentError(res, error);
  }
});

router.post("/payments/razorpay/webhook", async (req, res) => {
  if (!isWebhookConfigured()) {
    res.status(503).json({ error: "WEBHOOK_NOT_CONFIGURED" });
    return;
  }
  const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
  const signature = req.headers["x-razorpay-signature"]?.toString() ?? "";
  if (!rawBody || !isWebhookSignatureValid(rawBody, signature)) {
    res.status(400).json({ error: "INVALID_SIGNATURE" });
    return;
  }

  let event: Parameters<typeof handleVerifiedWebhook>[0];
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }

  try {
    const outcome = await handleVerifiedWebhook(event);
    res.log.info({ event: event.event, outcome }, "razorpay webhook");
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof PaymentError) {
      // Signed but not acceptable (e.g. amount mismatch): acknowledge, don't retry.
      res.log.warn({ event: event.event, code: error.code }, "razorpay webhook rejected");
      res.json({ ok: false });
      return;
    }
    // Unexpected failure: non-2xx so Razorpay retries later.
    res.log.error({ err: error }, "razorpay webhook failed");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
