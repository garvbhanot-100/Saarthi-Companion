import { useClerk } from "@clerk/clerk-react";

export function ClerkSignOut({ onDone }: { onDone: () => void }) {
  const clerk = useClerk();
  return (
    <button
      type="button"
      onClick={() => {
        void clerk.signOut().finally(onDone);
      }}
      className="text-sm text-slate-300 hover:text-white border border-slate-600/80 hover:border-slate-500 rounded-xl px-4 py-2.5 bg-slate-900/40 backdrop-blur transition"
    >
      Sign out
    </button>
  );
}