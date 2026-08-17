"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/lib/cart-context";
import { useCreateOrder } from "@/lib/hooks";
import { CheckoutTimeline } from "@ros/ui";
import { CheckCircle, MapPin, CreditCard } from "lucide-react";
import { checkoutSchema, CheckoutForm } from "./checkout-schema";
import OrderSummary from "./order-summary";
import DeliveryForm from "./delivery-form";
import PaymentForm from "./payment-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, freeDeliveryThreshold, clearCart } = useCart();
  const { create, loading: creating, error: createError } = useCreateOrder();
  const [step, setStep] = useState(1);

  const deliveryCost = subtotal >= freeDeliveryThreshold ? 0 : 9.99;
  const total = subtotal + deliveryCost;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryType: "delivery", paymentMethod: "online", tip: 0 },
  });

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Torba jest pusta</h1>
        <p className="text-neutral-500 mb-6">Dodaj produkty przed przejściem do kasy.</p>
        <Link href="/menu" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">Przeglądaj menu</Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const order = await create({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          addons: i.addons.map((a) => ({ addonId: a.addonId, quantity: a.quantity })),
          notes: i.notes,
        })),
        deliveryType: data.deliveryType,
        address: data.deliveryType === "delivery" ? {
          street: data.street!, buildingNumber: data.buildingNumber!,
          apartmentNumber: data.apartmentNumber, city: data.city!,
          postalCode: data.postalCode!, floor: data.floor, intercom: data.intercom,
        } : undefined,
        contact: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        tip: data.tip,
      });
      clearCart();
      router.push(`/track/${order.id}`);
    } catch {}
  };

  const steps = [
    { label: "Torba", icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Dane", icon: <MapPin className="w-4 h-4" /> },
    { label: "Płatność", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
          <Link href="/bag" className="text-sm font-medium text-red-600 hover:underline">← Wróć do torby</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-32">
        <CheckoutTimeline steps={steps} currentStep={step} className="mb-8" />
        {createError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>Błąd:</strong> {createError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <OrderSummary items={items} subtotal={subtotal} freeDeliveryThreshold={freeDeliveryThreshold}
              deliveryCost={deliveryCost} total={total} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <>
              <DeliveryForm register={register} errors={errors} deliveryType={deliveryType} deliveryCost={deliveryCost} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 px-6 py-4 bg-neutral-100 text-neutral-700 font-bold rounded-full hover:bg-neutral-200 transition">← Wstecz</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg">Dalej: Płatność →</button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <PaymentForm register={register} errors={errors} paymentMethod={paymentMethod} total={total} creating={creating} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 px-6 py-4 bg-neutral-100 text-neutral-700 font-bold rounded-full hover:bg-neutral-200 transition">← Wstecz</button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  );
}
