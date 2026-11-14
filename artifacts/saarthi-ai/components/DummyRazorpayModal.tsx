import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PREMIUM_PRICE_INR } from "@/constants/subscription";
import { useLanguage } from "@/context/LanguagesContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onSimulateSuccess: () => void;
};

export function DummyRazorpayModal({
  visible,
  busy,
  onClose,
  onSimulateSuccess,
}: Props) {
  const c = useColors();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: "#072654" }]}>
              <Text style={styles.brandText}>Razorpay</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("cancel")}
              onPress={onClose}
              disabled={busy}
              hitSlop={12}
            >
              <Feather name="x" size={22} color={c.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.title, { color: c.foreground }]}>
            {t("razorpayCheckoutTitle")}
          </Text>
          <Text style={[styles.sub, { color: c.mutedForeground }]}>
            {t("razorpayCheckoutDescription")}
          </Text>

          <View
            style={[
              styles.amountBox,
              { backgroundColor: c.primarySoft, borderColor: c.border },
            ]}
          >
            <Text style={[styles.amountLabel, { color: c.mutedForeground }]}>
              {t("amountDue")}
            </Text>
            <Text style={[styles.amount, { color: c.foreground }]}>
              ₹{PREMIUM_PRICE_INR}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("razorpaySimulatePay")}
            onPress={onSimulateSuccess}
            disabled={busy}
            style={({ pressed }) => [
              styles.payBtn,
              {
                backgroundColor: "#528FF0",
                opacity: pressed || busy ? 0.85 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>{t("razorpaySimulatePay")}</Text>
            )}
          </Pressable>

          <Text style={[styles.note, { color: c.mutedForeground }]}>
            {t("razorpayDemoNote")}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brandMark: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  brandText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  amountBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: "700",
  },
  payBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  note: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});