"use client";

import { useState, useEffect } from "react";
import SmsAuthStep from "./sms-auth-step";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useCreateOrder } from "@/lib/hooks";
import axios from "axios";
import { FreeDeliveryProgress } from "@ros/ui";
import { CheckoutTimeline } from "@ros/ui";
import { MapPin, CreditCard, Smartphone, Banknote, ChevronLeft, Check, AlertCircle } from "lucide-react";

const DELIVERY_COST = 9.99;
const FREE_DELIVERY_THRESHOLD = 50;

interface DeliveryForm {
  deliveryType: "delivery" | "pickup";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  city: string;
  postalCode: string;
  floor: string;
  intercom: string;
  notes: string;
}

const initialDeliveryForm: DeliveryForm = {
  deliveryType: "delivery",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  street: "",
  buildingNumber: "",
  apartmentNumber: "",
  city: "",
  postalCode: "",
  floor: "",
  intercom: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, deliveryCost, total, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const createOrder = useCreateOrder();
  const [step, setStep] = useState(1);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    ...initialDeliveryForm,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "card_on_delivery">("cash_on_delivery");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saveData, setSaveData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuth(true);
    }
  }, [isLoading, isAuthenticated]);

  // Redirect if cart is empty
  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Twoja torba jest pusta</h1>
          <p className="text-neutral-500 mb-6">Dodaj produkty, aby przejść do zamówienia.</p>
          <Link href="/menu" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition inline-block">
            Przeglądaj menu
          </Link>
        </div>
      </div>
    );
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!deliveryForm.firstName.trim()) newErrors.firstName = "Imię jest wymagane";
    if (!deliveryForm.lastName.trim()) newErrors.lastName = "Nazwisko jest wymagane";
    if (!deliveryForm.phone.trim()) newErrors.phone = "Telefon jest wymagany";
    else if (!/^\+48[0-9]{9}$/.test(deliveryForm.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Nieprawidłowy format (+48 123 456 789)";
    }
    if (!deliveryForm.email.trim()) newErrors.email = "E-mail jest wymagany";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email)) {
      newErrors.email = "Nieprawidłowy e-mail";
    }
    if (deliveryForm.deliveryType === "delivery") {
      if (!deliveryForm.street.trim()) newErrors.street = "Ulica jest wymagana";
      if (!deliveryForm.buildingNumber.trim()) newErrors.buildingNumber = "Numer budynku jest wymagany";
      if (!deliveryForm.city.trim()) newErrors.city = "Miasto jest wymagane";
      if (!deliveryForm.postalCode.trim()) newErrors.postalCode = "Kod pocztowy jest wymagany";
      else if (!/^[0-9]{2}-[0-9]{3}$/.test(deliveryForm.postalCode)) {
        newErrors.postalCode = "Format: 00-000";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      if (saveData) {
        try {
      localStorage.setItem("weboworos_delivery_data", JSON.stringify(deliveryForm));
    } catch (e) {
      console.warn("Failed to save delivery data to localStorage", e);
    }
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push("/bag");
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setErrors({ terms: "Musisz zaakceptować regulamin" });
      return;
    }
    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          addons: item.addons.map((a) => ({ addonId: a.addonId, quantity: a.quantity })),
          quantity: item.quantity,
          notes: item.notes,
        })),
        deliveryType: deliveryForm.deliveryType,
        contact: {
          firstName: deliveryForm.firstName,
          lastName: deliveryForm.lastName,
          phone: deliveryForm.phone.replace(/\s/g, "").replace(/^\+48/, ""),
          email: deliveryForm.email,
        },
        address: deliveryForm.deliveryType === "delivery" ? {
          street: deliveryForm.street,
          buildingNumber: deliveryForm.buildingNumber,
          apartmentNumber: deliveryForm.apartmentNumber || undefined,
          city: deliveryForm.city,
          postalCode: deliveryForm.postalCode,
          floor: deliveryForm.floor || undefined,
          intercom: deliveryForm.intercom || undefined,
        } : undefined,
        notes: deliveryForm.notes || undefined,
        paymentMethod,
      };
      const order = await createOrder.mutateAsync(orderData);
      clearCart();
      router.push(`/track/${order.id}`);
    } catch (err: unknown) {
      let message = "Wystąpił błąd podczas składania zamówienia";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrors({ submit: message });
      setSubmitting(false);
    }
  };

  // SMS auth gate — require login before checkout
  if (showAuth) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-neutral-600 hover:text-red-600 transition">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Wróć</span>
            </button>
            <h1 className="text-lg font-bold text-neutral-900">Weryfikacja</h1>
            <div className="w-20" />
          </div>
        </header>
        <div className="py-12">
          <div className="max-w-3xl mx-auto px-4">
            <SmsAuthStep onComplete={() => setShowAuth(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1 text-neutral-600 hover:text-red-600 transition">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{step === 1 ? "Wróć do torby" : "Wstecz"}</span>
          </button>
          <h1 className="text-lg font-bold text-neutral-900">Zamówienie</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <CheckoutTimeline currentStep={step} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Delivery */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">Dane dostawy</h2>

            {/* Delivery Type */}
            <div className="flex gap-4">
              <button
                onClick={() => setDeliveryForm({ ...deliveryForm, deliveryType: "delivery" })}
                className={`flex-1 p-4 rounded-xl border-2 text-center transition ${
                  deliveryForm.deliveryType === "delivery"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Dostawa</span>
                <p className="text-sm mt-1">{subtotal >= FREE_DELIVERY_THRESHOLD ? "Darmowa" : `${DELIVERY_COST} zł`}</p>
              </button>
              <button
                onClick={() => setDeliveryForm({ ...deliveryForm, deliveryType: "pickup" })}
                className={`flex-1 p-4 rounded-xl border-2 text-center transition ${
                  deliveryForm.deliveryType === "pickup"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Check className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Odbiór osobisty</span>
                <p className="text-sm mt-1">Bezpłatny</p>
              </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Imię *</label>
                  <input
                    type="text"
                    value={deliveryForm.firstName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, firstName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                  />
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nazwisko *</label>
                  <input
                    type="text"
                    value={deliveryForm.lastName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, lastName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                  />
                  {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon *</label>
                <input
                  type="tel"
                  value={deliveryForm.phone}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                  placeholder="+48 123 456 789"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={deliveryForm.email}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              {deliveryForm.deliveryType === "delivery" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Ulica *</label>
                      <input
                        type="text"
                        value={deliveryForm.street}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, street: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.street ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                      />
                      {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Numer *</label>
                      <input
                        type="text"
                        value={deliveryForm.buildingNumber}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, buildingNumber: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.buildingNumber ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                      />
                      {errors.buildingNumber && <p className="text-red-600 text-xs mt-1">{errors.buildingNumber}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Mieszkanie</label>
                      <input
                        type="text"
                        value={deliveryForm.apartmentNumber}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, apartmentNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Piętro</label>
                      <input
                        type="text"
                        value={deliveryForm.floor}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, floor: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Domofon</label>
                      <input
                        type="text"
                        value={deliveryForm.intercom}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, intercom: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Miasto *</label>
                      <input
                        type="text"
                        value={deliveryForm.city}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.city ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                      />
                      {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Kod pocztowy *</label>
                      <input
                        type="text"
                        value={deliveryForm.postalCode}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, postalCode: e.target.value })}
                        placeholder="00-000"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.postalCode ? "border-red-300 bg-red-50" : "border-neutral-200"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition`}
                      />
                      {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Uwagi do zamówienia</label>
                <textarea
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition resize-none"
                  placeholder="Np. proszę o cienkie ciasto, bez papryki..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveData}
                  onChange={(e) => setSaveData(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-neutral-600">Zapisz dane na przyszłość</span>
              </label>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-lg"
            >
              Dalej: Płatność →
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">Metoda płatności</h2>

            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("cash_on_delivery")}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-red-600 bg-red-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Banknote className={`w-6 h-6 ${paymentMethod === "cash_on_delivery" ? "text-red-600" : "text-neutral-400"}`} />
                <div className="text-left">
                  <p className={`font-medium ${paymentMethod === "cash_on_delivery" ? "text-red-700" : "text-neutral-900"}`}>Gotówka przy odbiorze</p>
                  <p className="text-sm text-neutral-500">Zapłać gotówką przy dostawie lub odbiorze</p>
                </div>
                {paymentMethod === "cash_on_delivery" && <Check className="w-5 h-5 text-red-600 ml-auto" />}
              </button>

              <button
                onClick={() => setPaymentMethod("card_on_delivery")}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                  paymentMethod === "card_on_delivery"
                    ? "border-red-600 bg-red-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === "card_on_delivery" ? "text-red-600" : "text-neutral-400"}`} />
                <div className="text-left">
                  <p className={`font-medium ${paymentMethod === "card_on_delivery" ? "text-red-700" : "text-neutral-900"}`}>Karta przy odbiorze</p>
                  <p className="text-sm text-neutral-500">Płatność terminalem przy dostawie lub odbiorze</p>
                </div>
                {paymentMethod === "card_on_delivery" && <Check className="w-5 h-5 text-red-600 ml-auto" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-4 border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition"
              >
                ← Wstecz
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Dalej: Podsumowanie →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">Podsumowanie</h2>

            {/* Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-bold text-neutral-900 mb-3">Zamówione produkty</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-neutral-700">{item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ""}</span>
                    <span className="font-medium">{((item.basePrice + (item.variantPriceAdjustment || 0) + item.addons.reduce((s, a) => s + a.price * a.quantity, 0)) * item.quantity).toFixed(2)} zł</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 space-y-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Suma</span>
                  <span>{(subtotal ?? 0).toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Dostawa</span>
                  <span className={deliveryCost === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryCost === 0 ? "Darmowa" : `${deliveryCost.toFixed(2)} zł`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-bold text-neutral-900">Do zapłaty</span>
                  <span className="font-bold text-xl text-red-600">{(total ?? 0).toFixed(2)} zł</span>
                </div>
              </div>
            </div>

            {/* Delivery Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-bold text-neutral-900 mb-3">Dane dostawy</h3>
              <div className="space-y-1 text-sm text-neutral-600">
                <p><span className="font-medium">{deliveryForm.firstName} {deliveryForm.lastName}</span></p>
                <p>{deliveryForm.phone}</p>
                <p>{deliveryForm.email}</p>
                {deliveryForm.deliveryType === "delivery" ? (
                  <p>{deliveryForm.street} {deliveryForm.buildingNumber}{deliveryForm.apartmentNumber ? `/${deliveryForm.apartmentNumber}` : ""}, {deliveryForm.postalCode} {deliveryForm.city}</p>
                ) : (
                  <p className="text-green-600 font-medium">Odbiór osobisty</p>
                )}
                {deliveryForm.notes && <p className="text-amber-600 italic mt-2">{deliveryForm.notes}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setErrors((prev) => { const { terms, ...rest } = prev; return rest; });
                  }}
                  className="w-5 h-5 mt-0.5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-neutral-600">
                  Akceptuję <Link href="/terms" className="text-red-600 hover:underline">regulamin</Link> i <Link href="/privacy" className="text-red-600 hover:underline">politykę prywatności</Link> oraz wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji zamówienia.
                </span>
              </label>
              {errors.terms && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.terms}
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 py-4 border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition disabled:opacity-50"
              >
                ← Wstecz
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? "Składanie zamówienia..." : `Zamów i zapłać ${(total ?? 0).toFixed(2)} zł`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
