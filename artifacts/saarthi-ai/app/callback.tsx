import { Redirect } from "expo-router";

/** Deep-link landing for native OAuth (`com.garv.saarthiai://callback`). */
export default function OAuthCallback() {
  return <Redirect href="/auth" />;
}
