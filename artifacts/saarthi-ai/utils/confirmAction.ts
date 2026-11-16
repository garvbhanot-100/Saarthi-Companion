import { Alert, Platform } from "react-native";

/** Native Alert; on web uses window.confirm so sign-out works in the browser. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>,
  cancelLabel = "Cancel",
) {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.confirm) {
    const prompt = message ? `${title}\n\n${message}` : title;
    if (window.confirm(prompt)) {
      void onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    {
      text: confirmLabel,
      style: "destructive",
      onPress: () => void onConfirm(),
    },
  ]);
}