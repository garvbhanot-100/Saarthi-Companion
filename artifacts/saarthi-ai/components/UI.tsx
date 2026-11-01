import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { MotionPressable } from "@/components/Motion";
import { useColors } from "@/hooks/useColors";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  const c = useColors();
  return (
    <View style={s.row}>
      <View style={[s.logo, { backgroundColor: c.primary }]}>
        <Feather
          name="compass"
          size={compact ? 16 : 20}
          color={c.primaryForeground}
        />
      </View>
      {!compact && (
        <Text style={[s.logoText, { color: c.foreground }]}>
          Saarthi <Text style={{ color: c.primary }}>AI</Text>
        </Text>
      )}
    </View>
  );
}

export function AppInput({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 13 }}>
      {label && <Text style={[s.label, { color: c.foreground }]}>{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor={c.mutedForeground}
        style={[
          s.input,
          {
            backgroundColor: c.card,
            borderColor: error ? c.destructive : c.input,
            color: c.foreground,
          },
          props.style,
        ]}
      />
      {error && (
        <Text style={[s.error, { color: c.destructive }]}>{error}</Text>
      )}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  disabled?: boolean;
  small?: boolean;
}) {
  const c = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      testID={`button-${title.toLowerCase().replaceAll(" ", "-")}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.primary,
        small && s.small,
        {
          backgroundColor: c.primary || "#3157C8",
          opacity: disabled ? 0.65 : pressed ? 0.86 : 1,
        },
      ]}
    >
      <Text
        style={[
          s.primaryText,
          small && s.smallText,
          { color: "#3157C8" },
        ]}
      >
        {title}
      </Text>
      {icon && (
        <Feather
          name={icon}
          size={small ? 15 : 17}
          color={c.primaryForeground}
        />
      )}
    </MotionPressable>
  );
}

export function GhostButton({
  title,
  onPress,
  icon,
  small = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  small?: boolean;
}) {
  const c = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        s.ghost,
        small && s.small,
        { borderColor: c.border, backgroundColor: pressed ? c.muted : c.card },
      ]}
    >
      {icon && <Feather name={icon} size={small ? 15 : 17} color={c.primary} />}
      <Text style={[s.primaryText, small && s.smallText, { color: c.primary }]}>
        {title}
      </Text>
    </MotionPressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
  label: string;
}) {
  const c = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconBtn,
        { backgroundColor: pressed ? c.muted : c.card, borderColor: c.border },
      ]}
    >
      <Feather name={icon} size={19} color={c.foreground} />
    </MotionPressable>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = useColors();
  return (
    <View style={s.section}>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Text style={[s.eyebrow, { color: c.primary }]}>
            {eyebrow.toUpperCase()}
          </Text>
        )}
        <Text style={[s.sectionTitle, { color: c.foreground }]}>{title}</Text>
      </View>
      {action && onAction && (
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onAction}
          style={s.sectionAction}
        >
          <Text style={[s.link, { color: c.primary }]}>{action}</Text>
        </MotionPressable>
      )}
    </View>
  );
}

export function SourceRow({
  label,
  onPress,
}: {
  label: string;
  url?: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.source, { backgroundColor: c.primarySoft }]}
    >
      <View style={[s.sourceIcon, { backgroundColor: c.card }]}>
        <Feather name="shield" size={14} color={c.success} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.sourceLabel, { color: c.foreground }]}>{label}</Text>
        <Text style={[s.sourceSub, { color: c.mutedForeground }]}>
          Official source
        </Text>
      </View>
      <Feather name="external-link" size={16} color={c.primary} />
    </MotionPressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 7 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  error: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 6 },
 primary: {
  minHeight: 54,
  borderRadius: 16,
  paddingHorizontal: 20,
  flexDirection: "row",
  gap: 10,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#183674",
  shadowOpacity: 0.16,
  shadowRadius: 9,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
},
  ghost: {
    minHeight: 53,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  small: { minHeight: 39, borderRadius: 12, paddingHorizontal: 13 },
  smallText: { fontSize: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 13,
    gap: 10,
  },
  sectionAction: { paddingVertical: 5, paddingHorizontal: 2 },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.25,
  },
  link: { fontSize: 13, fontFamily: "Inter_700Bold" },
  source: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 11,
    marginTop: 8,
  },
  sourceIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceLabel: { fontFamily: "Inter_700Bold", fontSize: 13 },
  sourceSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
});
