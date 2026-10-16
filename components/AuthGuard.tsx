"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import "@/styles/claymorphism.css";
import "@/styles/glassmorphism.css";
import "@/styles/liquid-glassmorphism.css";
import "@/styles/neumorphism.css";
import "@/styles/skeuomorphism.css";
import { getFamilyTreeTheme } from "@/utils/theme";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getFamilyTreeTheme();

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (!session) {
        router.replace("/login");
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      if (!session) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center clay-bg">
        <div className="clay-card p-5 flex items-center gap-3 text-xs font-semibold text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Memeriksa autentikasi...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
