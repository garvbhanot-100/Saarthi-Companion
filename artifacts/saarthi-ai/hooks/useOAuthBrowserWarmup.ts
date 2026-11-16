import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

/** Android Chrome warm-up for OAuth; no-op on web and iOS. */
export function useOAuthBrowserWarmup() {
  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}