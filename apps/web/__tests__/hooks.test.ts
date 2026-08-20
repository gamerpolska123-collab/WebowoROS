import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMenu, useCreateOrder } from "@/lib/hooks";
import { api } from "@/lib/api";
jest.mock("@/lib/api", () => ({ api: { get: jest.fn(), post: jest.fn() }, getWebSocketUrl: jest.fn(() => "ws://localhost:4001") }));
const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
describe("Hooks", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it("should fetch menu data", async () => {
    const mockCategories = [{ id: "1", name: "Pizze", slug: "pizze", products: [] }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockCategories });
    const { result } = renderHook(() => useMenu(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
  it("should create order with idempotency key", async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: "order-1" } });
    const { result } = renderHook(() => useCreateOrder(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ items: [], deliveryType: "pickup", deliveryFirstName: "Test", deliveryLastName: "User", deliveryPhone: "+48123456789", deliveryEmail: "test@test.pl", paymentMethod: "cash" });
    const callArgs = (api.post as jest.Mock).mock.calls[0];
    expect(callArgs[2].headers["X-Idempotency-Key"]).toMatch(/^[0-9a-f-]{36}$/);
  });
});
