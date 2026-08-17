import { api, getWebSocketUrl } from "@/lib/api";

describe("API Client", () => {
  it("should create axios instance with correct config", () => {
    expect(api.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
    expect(api.defaults.timeout).toBe(15000);
    expect(api.defaults.withCredentials).toBe(true);
  });
  it("should return WebSocket URL", () => {
    expect(getWebSocketUrl()).toContain("ws://");
  });
});
