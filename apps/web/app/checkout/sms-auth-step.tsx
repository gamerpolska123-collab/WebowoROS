"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import axios from "axios";
import { Smartphone } from "lucide-react";

interface SmsAuthStepProps {
  onComplete: () => void;
}

type AuthStep = 'phone' | 'code' | 'set-password' | 'login';

export default function SmsAuthStep({ onComplete }: SmsAuthStepProps) {
  const { sendSmsCode, verifySmsCode, setPassword, login } = useAuth();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState("");

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
      let message = "Nie udało się wysłać kodu.";
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
        setStep('login');
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
      onComplete();
    } catch (err: unknown) {
      let message = "Nie udało się ustawić hasła.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      onComplete();
    } catch (err: unknown) {
      let message = "Nieprawidłowe hasło.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">
          {step === 'phone' && 'Weryfikacja telefonu'}
          {step === 'code' && 'Kod z SMS'}
          {step === 'set-password' && 'Ustaw hasło'}
          {step === 'login' && 'Wpisz hasło'}
        </h2>
        <p className="text-neutral-500 mt-2">
          {step === 'phone' && 'Podaj numer telefonu, aby kontynuować zamówienie'}
          {step === 'code' && `Wpisz 4-cyfrowy kod wysłany na ${phone}`}
          {step === 'set-password' && 'Ustaw hasło do swojego konta'}
          {step === 'login' && 'Wpisz hasło, aby się zalogować'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center mb-4">
          {error}
        </div>
      )}

      {demoCodeHint && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm text-center mb-4">
          {demoCodeHint}
        </div>
      )}

      {step === 'phone' && (
        <form onSubmit={handleSendCode} className="space-y-4">
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
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
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
          <button
            type="button"
            onClick={() => { setStep('phone'); setCode(''); setError(''); }}
            className="w-full py-3 text-neutral-500 hover:text-red-600 transition text-sm"
          >
            Zmień numer telefonu
          </button>
        </form>
      )}

      {step === 'set-password' && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nowe hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
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
            {loading ? "Ustawianie..." : "Ustaw hasło i kontynuuj"}
          </button>
        </form>
      )}

      {step === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
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
            {loading ? "Logowanie..." : "Zaloguj się i kontynuuj"}
          </button>
          <button
            type="button"
            onClick={() => { setStep('set-password'); setPasswordValue(''); setError(''); }}
            className="w-full py-3 text-neutral-500 hover:text-red-600 transition text-sm"
          >
            Nie pamiętam hasła — ustaw nowe
          </button>
        </form>
      )}
    </div>
  );
}
