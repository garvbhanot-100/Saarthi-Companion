import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { clerkPublishableKey, isClerkAdminEnabled } from "./clerkConfig";
import "./index.css";

const root = (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  isClerkAdminEnabled ? (
    <ClerkProvider publishableKey={clerkPublishableKey}>{root}</ClerkProvider>
  ) : (
    root
  ),
);
