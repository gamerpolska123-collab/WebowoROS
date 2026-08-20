// Shared types across all ROS applications

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  KITCHEN = 'kitchen',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DeliveryType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CARD_ON_DELIVERY = 'card_on_delivery',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  badges: ProductBadge[];
  tags: string[];
  allergens: string[];
  variants: Variant[];
  addons: ProductAddon[];
  upsellRecommendations: UpsellRecommendation[];
}

export interface Variant {
  id: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
  isActive: boolean;
}

export interface UpsellRecommendation {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface OrderItemAddon {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addons: OrderItemAddon[];
  notes?: string;
}

export interface Address {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  city: string;
  postalCode: string;
  floor?: string;
  intercom?: string;
}

export interface Contact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryType: DeliveryType;
  address?: Address;
  contact: Contact;
  paymentMethod: PaymentMethod;
  notes?: string;
  tip?: number;
  appliedPromoIds?: string[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  estimatedDeliveryTime?: string;
  paymentUrl?: string;
  createdAt: string;
}

// ============================================================
// ARCHITECTURE MODELS (from docs/architektura.md)
// ============================================================

export interface UpsellConfig {
  id: string;
  name: string;
  type: 'cross_sell' | 'bundle' | 'last_minute' | 'threshold';
  rules: {
    triggerProductIds?: string[];
    recommendedProductIds?: string[];
    maxRecommendations?: number;
    displayTiming?: 'after_add' | 'before_checkout' | 'after_checkout';
    thresholdAmount?: number;
    discount?: number;
  };
  isActive: boolean;
  priority: number;
}

export interface BundleConfig {
  id: string;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  slots: {
    categoryId: string;
    quantity: number;
    label: string;
  }[];
  isActive: boolean;
}

export interface PromoConfig {
  id: string;
  name: string;
  type: 'discount' | 'free_delivery' | 'addon_deal';
  conditions: {
    minOrderValue?: number;
    applicableProductIds?: string[];
    timeRange?: { start: string; end: string };
  };
  reward: {
    type: 'percent' | 'fixed_price' | 'fixed_amount';
    value: number;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ProductBadge {
  id: string;
  productId: string;
  badgeType: 'bestseller' | 'new' | 'chef_choice' | 'limited';
  isActive: boolean;
  expiresAt?: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  variantId?: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string; // userId
  changedAt: string;
  reason?: string;
}

export interface SiteConfig {
  theme: 'light' | 'dark' | 'auto';
  cartIcon: 'pizza_bag' | 'classic_cart';
  addAnimation: 'fly_to_bag' | 'fade' | 'none';
  freeDeliveryThreshold: number;
  minOrderValue: number;
  enableConfigurator: boolean;
  enableSounds: boolean;
  enableConfetti: boolean;
  socialProofEnabled: boolean;
  socialProofInterval: number;
}

export interface Order extends OrderResponse {
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  cancellationReason?: string;
  deliveryType: DeliveryType;
  address?: Address;
  contact: Contact;
  paymentMethod: PaymentMethod;
  notes?: string;
  tip?: number;
  appliedPromoIds?: string[];
  paidAt?: string;
  confirmedAt?: string;
  preparedAt?: string;
  readyAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  rating?: number;
  review?: string;
  reviewSubmittedAt?: string;
}

// ============================================
// ORDER STATUS MAPS (centralized — use everywhere)
// ============================================

export const STATUS_LABELS_PL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: "Oczekuje płatności",
  [OrderStatus.PAID]: "Opłacone",
  [OrderStatus.CONFIRMED]: "Przyjęte",
  [OrderStatus.PREPARING]: "W przygotowaniu",
  [OrderStatus.READY_FOR_PICKUP]: "Gotowe",
  [OrderStatus.OUT_FOR_DELIVERY]: "W drodze",
  [OrderStatus.DELIVERED]: "Dostarczone",
  [OrderStatus.CANCELLED]: "Anulowane",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PAID]: "bg-blue-100 text-blue-800",
  [OrderStatus.CONFIRMED]: "bg-gray-100 text-gray-800",
  [OrderStatus.PREPARING]: "bg-orange-100 text-orange-800",
  [OrderStatus.READY_FOR_PICKUP]: "bg-green-100 text-green-800",
  [OrderStatus.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-800",
  [OrderStatus.DELIVERED]: "bg-green-500 text-white",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export const NEXT_STATUS_MAP: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING_PAYMENT]: null,
  [OrderStatus.PAID]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.READY_FOR_PICKUP,
  [OrderStatus.READY_FOR_PICKUP]: OrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: null,
  [OrderStatus.CANCELLED]: null,
};

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
];
