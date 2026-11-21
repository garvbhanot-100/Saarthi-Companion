import { SignIn } from "@clerk/clerk-react";

export function AdminSignIn() {
  return (
    <div className="flex justify-center w-full [&_.cl-rootBox]:w-full">
      <SignIn
        routing="hash"
        forceRedirectUrl={
          typeof window !== "undefined" ? window.location.href : "/"
        }
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "w-full shadow-none border-0 bg-transparent p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            footer: "hidden",
            socialButtonsBlockButton:
              "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl min-h-[52px]",
            formButtonPrimary:
              "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
          },
        }}
      />
    </div>
  );
}