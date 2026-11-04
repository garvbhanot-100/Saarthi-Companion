import { Redirect } from "expo-router";

/** Deep-link landing for Expo Go OAuth (`exp://…/--/sso-callback`). */
export default function SsoCallback() {
  return <Redirect href="/auth" />;
}
