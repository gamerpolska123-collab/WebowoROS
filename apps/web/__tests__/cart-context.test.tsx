import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/lib/cart-context";
const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;
describe("Cart Context", () => {
  beforeEach(() => { localStorage.clear(); });
  it("should start with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });
  it("should add item to cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addItem({ productId: "1", name: "Margherita", basePrice: 25, addons: [] }); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.subtotal).toBe(25);
  });
  it("should calculate free delivery", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addItem({ productId: "1", name: "Test", basePrice: 60, addons: [] }); });
    expect(result.current.deliveryCost).toBe(0);
  });
  it("should calculate paid delivery", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addItem({ productId: "1", name: "Test", basePrice: 20, addons: [] }); });
    expect(result.current.deliveryCost).toBe(9.99);
  });
});
