"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutForm } from "./checkout-schema";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  register: UseFormRegister<CheckoutForm>;
  errors: FieldErrors<CheckoutForm>;
  paymentMethod: string;
  total: number;
  creating: boolean;
}

export default function PaymentForm({ register, errors, paymentMethod, total, creating }: PaymentFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Płatność</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 space-y-4">
        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "online" ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
          <input type="radio" {...register("paymentMethod")} value="online" className="sr-only" />
          <CreditCard className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-neutral-900">Płatność online</p>
            <p className="text-sm text-neutral-500">BLIK, karta, Google Pay</p>
          </div>
        </label>

        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "cash" ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
          <input type="radio" {...register("paymentMethod")} value="cash" className="sr-only" />
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">zł</div>
          <div>
            <p className="font-semibold text-neutral-900">Gotówka przy odbiorze</p>
            <p className="text-sm text-neutral-500">Zapłać przy dostawie lub odbiorze</p>
          </div>
        </label>

        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "card_on_delivery" ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
          <input type="radio" {...register("paymentMethod")} value="card_on_delivery" className="sr-only" />
          <CreditCard className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-semibold text-neutral-900">Karta przy dostawie</p>
            <p className="text-sm text-neutral-500">Terminal u kierowcy</p>
          </div>
        </label>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Napiwek dla kierowcy (opcjonalnie)</label>
          <input type="number" {...register("tip")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="0" min={0} max={100} />
          {errors.tip && <p className="text-red-500 text-xs mt-1">{errors.tip.message}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex justify-between text-lg font-bold">
          <span>Do zapłaty</span>
          <span className="text-red-600 text-2xl">{total.toFixed(2)} zł</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={creating}
        className="w-full px-6 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creating ? "Przetwarzanie..." : "Zamów teraz 🍕"}
      </button>
    </div>
  );
}
