"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { TitanBot } from "../../components/titanbot/TitanBot";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isConnected, router]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 w-full max-w-lg">
        <AuthGuard>
          <div className="bg-surface-container/85 backdrop-blur-3xl border border-outline-variant/30 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/30 shadow-md bg-surface-container mx-auto p-1">
              <img
                src="/assets/branding/equorafilogo.jpeg"
                alt="EQUORA.FI Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-headline-md font-bold text-on-surface">
              Authentication Successful
            </h2>
            <p className="text-xs text-on-surface-variant">
              Redirecting to EQUORA Terminal Dashboard...
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
            >
              Enter Dashboard
            </button>
          </div>
        </AuthGuard>
      </div>
    </div>
  );
}
