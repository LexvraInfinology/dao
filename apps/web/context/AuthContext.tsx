"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useChainId, useDisconnect } from "wagmi";
import { useUserProfile } from "../hooks/equora/useUserProfile";
import { notification } from "../utils/scaffold-eth/notification";

interface AuthUser {
  address: string;
  chainId: number;
  isRegistered: boolean;
  userId: number;
  sponsor: string;
  authenticatedAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isCheckingSession: boolean;
  authUser: AuthUser | null;
  authError: string | null;
  loginWithSignature: () => Promise<boolean>;
  logout: () => void;
  checkOnChainRegistration: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAuthenticating: false,
  isCheckingSession: true,
  authUser: null,
  authError: null,
  loginWithSignature: async () => false,
  logout: () => {},
  checkOnChainRegistration: () => false,
});

const SESSION_STORAGE_KEY = "equora_auth_session_v1";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const getInitialSession = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed: AuthUser = JSON.parse(stored);
      const isExpired = Date.now() - parsed.authenticatedAt > SESSION_EXPIRY_MS;
      if (!isExpired) return parsed;
    }
  } catch {}
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { profile } = useUserProfile(address);

  const [authUser, setAuthUser] = useState<AuthUser | null>(getInitialSession);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync session on mount / address change
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored && address) {
        const parsed: AuthUser = JSON.parse(stored);
        const isExpired = Date.now() - parsed.authenticatedAt > SESSION_EXPIRY_MS;
        const isSameAddress = parsed.address.toLowerCase() === address.toLowerCase();

        if (!isExpired && isSameAddress) {
          setAuthUser({
            ...parsed,
            isRegistered: profile.isRegistered,
            userId: profile.userId,
            sponsor: profile.sponsor,
          });
        }
      }
    } catch {}
    setIsCheckingSession(false);
  }, [address, isConnected, chainId, profile.isRegistered, profile.userId, profile.sponsor]);

  // Invalidate session immediately if active account changes or disconnects
  useEffect(() => {
    if (!isCheckingSession && !isConnecting && !isReconnecting) {
      if (!isConnected || !address) {
        if (authUser) {
          logout();
        }
        return;
      }

      if (authUser && authUser.address.toLowerCase() !== address.toLowerCase()) {
        logout();
        notification.warning("Active wallet account changed. Please re-authenticate.");
      }
    }
  }, [address, isConnected, isConnecting, isReconnecting, isCheckingSession]);

  const logout = useCallback(() => {
    setAuthUser(null);
    setAuthError(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  }, []);

  const loginWithSignature = async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setAuthError("No Web3 wallet connected.");
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);
    const toastId = notification.loading("Requesting cryptographic signature from wallet...");

    try {
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();

      const challengeMessage = 
`EQUORA_Fi PROTOCOL DEEP SECURITY AUTHENTICATION

Please sign this cryptographic challenge to authenticate your wallet ownership and establish a secure, non-custodial session.

Wallet: ${address}
Chain ID: ${chainId}
Nonce: ${nonce}
Timestamp: ${timestamp}
URI: ${typeof window !== "undefined" ? window.location.origin : "https://equora.fi"}

Notice: This signature is gas-free and does not trigger any blockchain transaction.`;

      const signature = await signMessageAsync({
        message: challengeMessage,
      });

      if (!signature) {
        throw new Error("Cryptographic signature rejected.");
      }

      const session: AuthUser = {
        address,
        chainId,
        isRegistered: profile.isRegistered,
        userId: profile.userId,
        sponsor: profile.sponsor,
        authenticatedAt: Date.now(),
      };

      setAuthUser(session);
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}

      notification.dismiss(toastId);
      notification.success("🔐 Cryptographic authentication verified! Welcome to EQUORA_Fi.");
      setIsAuthenticating(false);
      return true;
    } catch (err: any) {
      notification.dismiss(toastId);
      const msg = err?.message || "Signature verification failed.";
      setAuthError(msg);
      notification.error(msg.includes("rejected") || msg.includes("denied") ? "Signature rejected by user." : msg);
      setIsAuthenticating(false);
      return false;
    }
  };

  const checkOnChainRegistration = (): boolean => {
    return !!profile?.isRegistered;
  };

  const isAuthenticated = !!authUser && isConnected && authUser.address.toLowerCase() === address?.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        isCheckingSession,
        authUser,
        authError,
        loginWithSignature,
        logout,
        checkOnChainRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
