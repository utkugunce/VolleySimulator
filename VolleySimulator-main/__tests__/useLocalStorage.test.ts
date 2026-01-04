/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Import after mocking
import { useLocalStorage } from '../app/hooks/useLocalStorage';

// Helper to flush all promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Wait for hydration to complete
    await act(async () => {
      await flushPromises();
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should persist value to localStorage', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Wait for initial hydration
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new value'));
  });

  it('should retrieve value from localStorage on mount', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('stored value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Wait for hydration to read from localStorage
    await act(async () => {
      await flushPromises();
    });

    expect(result.current[0]).toBe('stored value');
  });

  it('should handle function updater', async () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0));

    // Wait for initial hydration
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle objects', async () => {
    const initialObj = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj-key', initialObj));

    // Wait for initial hydration
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      result.current[1]({ name: 'updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
  });
});
