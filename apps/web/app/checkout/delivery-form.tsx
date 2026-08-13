"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutForm } from "./checkout-schema";
import { Truck, MapPin } from "lucide-react";

interface DeliveryFormProps {
  register: UseFormRegister<CheckoutForm>;
  errors: FieldErrors<CheckoutForm>;
  deliveryType: string;
  deliveryCost: number;
}

export default function DeliveryForm({ register, errors, deliveryType, deliveryCost }: DeliveryFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Dane dostawy</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 space-y-4">
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${deliveryType === "delivery" ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
            <input type="radio" {...register("deliveryType")} value="delivery" className="sr-only" />
            <Truck className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-neutral-900">Dostawa</p>
              <p className="text-sm text-neutral-500">{deliveryCost === 0 ? "Darmowa" : `${deliveryCost.toFixed(2)} zł`}</p>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${deliveryType === "pickup" ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
            <input type="radio" {...register("deliveryType")} value="pickup" className="sr-only" />
            <MapPin className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-neutral-900">Odbiór osobisty</p>
              <p className="text-sm text-neutral-500">Darmowy</p>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Imię</label>
            <input {...register("firstName")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="Jan" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nazwisko</label>
            <input {...register("lastName")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="Kowalski" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon</label>
            <input {...register("phone")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="+48 123 456 789" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
            <input {...register("email")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="jan@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>

        {deliveryType === "delivery" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ulica</label>
                <input {...register("street")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="Mickiewicza" />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Numer budynku</label>
                <input {...register("buildingNumber")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="12A" />
                {errors.buildingNumber && <p className="text-red-500 text-xs mt-1">{errors.buildingNumber.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Kod pocztowy</label>
                <input {...register("postalCode")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="00-001" />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Miasto</label>
                <input {...register("city")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="Warszawa" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mieszkanie (opcjonalnie)</label>
                <input {...register("apartmentNumber")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Piętro (opcjonalnie)</label>
                <input {...register("floor")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Domofon (opcjonalnie)</label>
              <input {...register("intercom")} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition" placeholder="123" />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Uwagi do zamówienia (opcjonalnie)</label>
          <textarea {...register("notes")} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition resize-none" placeholder="Np. proszę o cienkie ciasto, bez pieczarek..." />
        </div>
      </div>
    </div>
  );
}
