import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
jest.mock("@/lib/api", () => ({ api: { get: jest.fn(), post: jest.fn() } }));
const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
describe("Auth Context", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it("should start unauthenticated", () => {
    (api.get as jest.Mock).mockRejectedValue(new Error("Not authenticated"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
  it("should login successfully", async () => {
    const mockUser = { id: "1", email: "test@test.pl", firstName: "Jan", lastName: "Kowalski", role: "customer" };
    (api.post as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login("test@test.pl", "password123"); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@test.pl");
  });
  it("should logout successfully", async () => {
    (api.post as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.logout(); });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
