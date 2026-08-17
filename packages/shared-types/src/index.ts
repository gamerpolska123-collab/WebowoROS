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
  CARD = 'card',
  BLIK = 'blik',
  CASH_ON_DELIVERY = 'cash_on_delivery',
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
  badges: string[];
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
  quantity: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
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

// Alias dla kompatybilności z frontendem
export interface Order extends OrderResponse {}
