import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '../lib/hooks';
import { dashApi } from '../lib/api';

// Mock dashApi
jest.mock('../lib/api', () => ({
  dashApi: {
    getOrders: jest.fn(),
  },
}));

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders successfully', async () => {
    const mockOrdersResult = {
      data: [
        { id: '1', orderNumber: 'ORD-001', status: 'pending_payment', totalAmount: 45.99 },
        { id: '2', orderNumber: 'ORD-002', status: 'confirmed', totalAmount: 32.50 },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    (dashApi.getOrders as jest.Mock).mockResolvedValueOnce(mockOrdersResult);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.result).toEqual(mockOrdersResult);
    expect(result.current.error).toBeNull();
    expect(dashApi.getOrders).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('should handle fetch error', async () => {
    (dashApi.getOrders as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.result).toBeNull();
  });
});
