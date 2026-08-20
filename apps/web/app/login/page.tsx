"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import axios from "axios";
import { api } from "@/lib/api";

type Step = 'phone' | 'code' | 'password' | 'set-password' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendSmsCode, verifySmsCode, setPassword, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await sendSmsCode(phone);
      if (result.demoCode) {
        setDemoCodeHint(`Kod demo: ${result.demoCode}`);
      }
      setStep('code');
    } catch (err: unknown) {
      let message = "Nie udało się wysłać kodu. Spróbuj ponownie.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifySmsCode(phone, code);
      if (result.hasPassword) {
        setStep('password');
      } else {
        setStep('set-password');
      }
    } catch (err: unknown) {
      let message = "Nieprawidłowy lub wygasły kod.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      router.push("/");
    } catch (err: unknown) {
      let message = "Nieprawidłowy numer telefonu lub hasło.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }
    if (password.length < 8) {
      setError("Hasło musi mieć minimum 8 znaków.");
      return;
    }
    setLoading(true);
    try {
      await setPassword(phone, password, confirmPassword);
      router.push("/");
    } catch (err: unknown) {
      let message = "Nie udało się ustawić hasła. Spróbuj ponownie.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post('/auth/login', { email: adminEmail, password: adminPassword });
      router.push("/");
    } catch (err: unknown) {
      let message = "Nieprawidłowy email lub hasło.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 mx-auto mb-4 text-red-600 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            {step === 'admin' ? 'Logowanie admin' : 'WebowoROS'}
          </h1>
          <p className="text-neutral-500 mt-2">
            {step === 'phone' && 'Zaloguj się numerem telefonu'}
            {step === 'code' && 'Wpisz kod z SMS'}
            {step === 'password' && 'Wpisz swoje hasło'}
            {step === 'set-password' && 'Ustaw hasło do konta'}
            {step === 'admin' && 'Panel administracyjny'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* Demo hint */}
        {demoCodeHint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm text-center mb-4">
            {demoCodeHint}
          </div>
        )}

        {/* STEP: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Numer telefonu</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="+48 123 456 789"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Wysyłanie..." : "Wyślij kod SMS"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('admin'); setError(''); }}
                className="text-sm text-neutral-500 hover:text-red-600 transition"
              >
                Logowanie administratora
              </button>
            </div>
          </form>
        )}

        {/* STEP: Code */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Kod SMS</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition text-center text-2xl tracking-widest font-mono"
                placeholder="5555"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Weryfikacja..." : "Zweryfikuj kod"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="text-sm text-neutral-500 hover:text-red-600 transition"
              >
                Zmień numer telefonu
              </button>
            </div>
          </form>
        )}

        {/* STEP: Password (existing user) */}
        {step === 'password' && (
          <form onSubmit={handlePhoneLogin} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('phone'); setPassword(''); setError(''); }}
                className="text-sm text-neutral-500 hover:text-red-600 transition"
              >
                Inny numer telefonu
              </button>
            </div>
          </form>
        )}

        {/* STEP: Set Password (new user) */}
        {step === 'set-password' && (
          <form onSubmit={handleSetPassword} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Nowe hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="Minimum 8 znaków"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Powtórz hasło</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Ustawianie..." : "Ustaw hasło i zaloguj"}
            </button>
          </form>
        )}

        {/* STEP: Admin Login */}
        {step === 'admin' && (
          <form onSubmit={handleAdminLogin} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">E-mail</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="admin@weboworos.pl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Hasło</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); }}
                className="text-sm text-neutral-500 hover:text-red-600 transition"
              >
                Logowanie klienta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
