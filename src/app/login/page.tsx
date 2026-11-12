"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import DreamBackdrop from "@/components/ui/dream-backdrop";
import { Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      // The auth state change will be handled by the AuthProvider, which will redirect.
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      setLoading(false);
    }
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

        <div className="space-y-4 pt-2">
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

          <p className="text-[11px] text-muted-foreground">
            Synchronized with Firebase Auth & Cloud Firestore
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
