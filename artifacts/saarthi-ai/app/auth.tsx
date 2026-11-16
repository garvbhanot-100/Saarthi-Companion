import { Redirect } from "expo-router";

/** Legacy route — opens the dedicated login screen. */
export default function Auth() {
  return <Redirect href="/login" />;
}