"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Network, Mail, Lock, Loader2, LogIn } from "lucide-react";
import "@/styles/claymorphism.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        router.replace("/");
      } else {
        setCheckingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        router.replace("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center clay-bg">
        <div className="clay-card p-5 flex items-center gap-3 text-xs font-semibold text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 clay-bg text-slate-800">
      <div className="w-full max-w-sm clay-modal p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl clay-badge bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Network className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
            Masuk ke FamMap
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Silsilah Keluarga & Pemetaan Kerabat
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl clay-badge text-rose-600 bg-rose-50/50 border border-rose-200/50">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2 clay-input text-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2 clay-input text-xs">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 clay-button-primary text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
