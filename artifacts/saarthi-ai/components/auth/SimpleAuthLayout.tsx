import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MotionPressable } from "@/components/Motion";
import colors from "@/constants/colors";

export const AUTH_BG_GRADIENT = ["#6d28d9", "#5b5bd6", "#3b82f6"] as const;
export const AUTH_BTN_GRADIENT_LOGIN = ["#7c3aed", "#6366f1"] as const;
export const AUTH_BTN_GRADIENT_SIGNUP = ["#a855f7", "#ec4899"] as const;
export const AUTH_AVATAR_GRADIENT = ["#8b5cf6", "#ec4899"] as const;

const soft = {
  fieldBg: "#eef1f8",
  title: "#312e81",
  muted: "#64748b",
  link: "#4f46e5",
};

/** Auth screens use a fixed light soft-UI look on a purple gradient. */
export function useAuthLightColors() {
  return { ...colors.light, radius: colors.radius };
}

export function AuthSocialDivider({ label }: { label: string }) {
  return (
    <View style={divider.row}>
      <View style={divider.line} />
      <Text style={divider.text}>{label}</Text>
      <View style={divider.line} />
    </View>
  );
}

export function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  trailing,
  labelAction,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
  trailing?: React.ReactNode;
  labelAction?: { text: string; onPress: () => void };
}) {
  return (
    <View style={field.wrap}>
      <View style={field.labelRow}>
        <Text style={field.label}>{label}</Text>
        {labelAction ? (
          <Pressable
            accessibilityRole="link"
            onPress={labelAction.onPress}
            hitSlop={8}
          >
            <Text style={field.labelAction}>{labelAction.text}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={field.box}>
        <View style={field.iconBubble}>
          <Feather name={icon} size={16} color={soft.link} />
        </View>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={field.input}
        />
        {trailing}
      </View>
    </View>
  );
}

export function AuthGradientButton({
  label,
  busy,
  onPress,
  gradientColors,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
  gradientColors: readonly [string, string];
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        primary.wrap,
        { opacity: busy ? 0.7 : pressed ? 0.92 : 1 },
      ]}
    >
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={primary.gradient}
      >
        <Text style={primary.text}>{label}</Text>
      </LinearGradient>
    </MotionPressable>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <View style={error.box}>
      <Feather name="alert-circle" size={16} color="#d97706" />
      <Text style={error.text}>{message}</Text>
    </View>
  );
}

type SoftAuthLayoutProps = {
  screenTitle: string;
  gradientButtonColors?: readonly [string, string];
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function SoftAuthLayout({
  screenTitle,
  children,
  footer,
}: SoftAuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...AUTH_BG_GRADIENT]}
      style={layout.root}
    >
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          layout.scroll,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <View style={layout.card}>
          <LinearGradient
            colors={[...AUTH_AVATAR_GRADIENT]}
            style={layout.avatar}
          >
            <Feather name="user" size={28} color="#fff" />
          </LinearGradient>

          <Text style={layout.screenTitle}>{screenTitle}</Text>

          <View style={layout.body}>{children}</View>

          {footer ? <View style={layout.cardFooter}>{footer}</View> : null}
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

export function AuthSwitchLink({
  prompt,
  actionLabel,
  onPress,
}: {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={layout.switchRow}
    >
      <Text style={layout.switchPrompt}>{prompt} </Text>
      <Text style={layout.switchAction}>{actionLabel}</Text>
      <Feather name="chevron-right" size={16} color={soft.link} />
    </Pressable>
  );
}

export function AuthGuestButton({
  label,
  hint,
  disabled,
  onPress,
  variant = "card",
}: {
  label: string;
  hint?: string;
  disabled?: boolean;
  onPress: () => void;
  variant?: "card" | "onGradient";
}) {
  const onGradient = variant === "onGradient";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        layout.guestBtn,
        onGradient && layout.guestBtnOnGradient,
        { opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}
    >
      <Feather
        name="compass"
        size={18}
        color={onGradient ? "#fff" : soft.link}
      />
      <View style={layout.guestTextCol}>
        <Text
          style={[
            layout.guestLabel,
            onGradient && layout.guestLabelOnGradient,
          ]}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            style={[
              layout.guestHint,
              onGradient && layout.guestHintOnGradient,
            ]}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      <Feather
        name="chevron-right"
        size={16}
        color={onGradient ? "rgba(255,255,255,0.9)" : soft.link}
      />
    </Pressable>
  );
}

/** @deprecated Use SoftAuthLayout */
export const SimpleAuthLayout = SoftAuthLayout;
export function AuthPrimaryButton(props: {
  label: string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <AuthGradientButton
      {...props}
      gradientColors={AUTH_BTN_GRADIENT_LOGIN}
    />
  );
}
export function AuthDivider({ label }: { label: string }) {
  return <AuthSocialDivider label={label} />;
}

const divider = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e2e8f0",
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: soft.muted,
  },
});

const field = StyleSheet.create({
  wrap: { marginBottom: 16 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#334155",
  },
  labelAction: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: soft.link,
  },
  box: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: soft.fieldBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    shadowColor: "#94a3b8",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#1e293b",
    paddingVertical: 12,
  },
});

const primary = StyleSheet.create({
  wrap: {
    marginTop: 6,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#6d28d9",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  gradient: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
});

const error = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "flex-start",
    backgroundColor: "#fff7ed",
  },
  text: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
    color: "#1e293b",
  },
});

const layout = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 22,
    shadowColor: "#312e81",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  avatar: {
    position: "absolute",
    alignSelf: "center",
    top: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: soft.title,
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: -0.3,
  },
  body: {},
  cardFooter: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  switchPrompt: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: soft.muted,
  },
  switchAction: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: soft.link,
  },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  guestBtnOnGradient: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  guestTextCol: {
    flex: 1,
    gap: 2,
  },
  guestLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#334155",
  },
  guestLabelOnGradient: {
    color: "#fff",
  },
  guestHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: soft.muted,
    lineHeight: 15,
  },
  guestHintOnGradient: {
    color: "rgba(255,255,255,0.85)",
  },
});