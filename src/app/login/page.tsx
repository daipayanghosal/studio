"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import DreamBackdrop from "@/components/ui/dream-backdrop";
import { useAuth } from "@/components/auth/auth-provider";
import { Sparkles, Loader2, AlertCircle, Copy, Check, ExternalLink, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [currentHostname, setCurrentHostname] = useState("");
  const [copiedDomain, setCopiedDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHostname(window.location.hostname);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      setLoading(true);
      setErrorMessage(null);
      setIsUnauthorizedDomain(false);

      await signInWithPopup(auth, provider);
      // The auth state change is handled by AuthProvider which will route to '/'
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      setLoading(false);

      const code = error?.code || "";
      const message = error?.message || "An unexpected authentication error occurred.";

      if (code === "auth/unauthorized-domain") {
        setIsUnauthorizedDomain(true);
        setErrorMessage(
          `Domain not authorized: "${window.location.hostname}" is not yet in Firebase Auth's Authorized Domains list.`
        );
      } else if (code === "auth/popup-blocked") {
        // Try redirect if popup was blocked
        try {
          setLoading(true);
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          setErrorMessage("Popup blocked by browser. Please allow popups for this site.");
        }
      } else if (code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in popup was closed before completion. Please try again.");
      } else {
        setErrorMessage(message);
      }
    }
  };

  const handleCopyHostname = async () => {
    if (!currentHostname) return;
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch {}
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-body text-foreground">
      <DreamBackdrop />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl dream-card border border-white/20 dark:border-white/10 shadow-2xl space-y-6 text-center backdrop-blur-2xl">
        <div className="flex flex-col items-center">
          <div className="relative mb-5 group">
            <Image
              src="/appicon.png"
              alt="ChronoCanvas Logo"
              width={88}
              height={88}
              className="rounded-2xl shadow-xl transition-transform group-hover:scale-105"
              priority
            />
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-purple-500/30 to-sky-400/30 blur-md -z-10 animate-aurora-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <span>Multilingual Sanctuary • বাংলা ও ইংরেজি</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            ChronoCanvas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Ethereal space to reflect, journal in বাংলা & English, and curate syntax-highlighted code.
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-left space-y-2 text-xs text-destructive-foreground animate-in fade-in-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground text-xs">Authentication Notice</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            {isUnauthorizedDomain && currentHostname && (
              <div className="pt-2 border-t border-destructive/20 space-y-2">
                <p className="text-[11px] text-foreground font-medium">
                  To enable Google Sign-In for this deployment:
                </p>
                <ol className="list-decimal list-inside text-[10px] text-muted-foreground space-y-1">
                  <li>Go to Firebase Console &gt; Authentication &gt; Settings</li>
                  <li>Click <strong>Authorized Domains</strong> &gt; Add Domain</li>
                  <li>Add: <code className="bg-muted px-1 py-0.5 rounded font-mono font-bold text-foreground">{currentHostname}</code> or <code className="bg-muted px-1 py-0.5 rounded font-mono font-bold text-foreground">vercel.app</code></li>
                </ol>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyHostname}
                    className="h-7 text-[11px] gap-1 flex-1"
                  >
                    {copiedDomain ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedDomain ? "Domain Copied" : "Copy Domain"}</span>
                  </Button>
                  <a
                    href="https://console.firebase.google.com/project/chronocanvas-nakny/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 inline-flex items-center gap-1 text-[11px] font-medium rounded-md border border-border bg-background hover:bg-muted text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Firebase Console</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Sign in with Google */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                className="h-4 w-4"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-62.2 62.2C297.7 99.8 274.9 88 248 88c-73.2 0-133.1 59.9-133.1 133.1s59.9 133.1 133.1 133.1c76.1 0 124.2-50.9 129.2-97.1H248v-69.8h235.5c2.3 12.7 3.5 25.7 3.5 39.5z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </Button>

          {/* Guest Mode Fallback */}
          <Button
            type="button"
            variant="outline"
            onClick={continueAsGuest}
            className="w-full h-11 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/60 transition-all gap-1.5"
          >
            <span>Continue as Guest / Explore Canvas</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          <p className="text-[11px] text-muted-foreground pt-1">
            Connected to Firebase project: <code className="font-mono text-foreground font-medium">chronocanvas-nakny</code>
          </p>
        </div>

        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
          Created with 💖 by{" "}
          <a
            href="https://www.linkedin.com/in/daipayan-ghosal/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-primary transition-colors"
          >
            Daipayan
          </a>
        </div>
      </div>
    </div>
  );
}
