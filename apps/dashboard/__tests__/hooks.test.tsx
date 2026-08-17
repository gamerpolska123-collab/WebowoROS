import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '../lib/hooks';
import { api } from '../lib/api';

// Mock api
jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders successfully', async () => {
    const mockOrders = [
      { id: '1', orderNumber: 'ORD-001', status: 'PENDING', total: 45.99 },
      { id: '2', orderNumber: 'ORD-002', status: 'CONFIRMED', total: 32.50 },
    ];
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockOrders });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.orders).toEqual(mockOrders);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(api.get).toHaveBeenCalledWith('/v1/orders');
  });

  it('should handle fetch error', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
