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

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
  });

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new value'));
  });

  it('should retrieve value from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored value');
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
  });

  it('should handle objects', () => {
    const initialObj = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj-key', initialObj));
    
    act(() => {
      result.current[1]({ name: 'updated', count: 5 });
    });
    
    expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));
    
    act(() => {
      result.current[1](['a', 'b', 'c']);
    });
    
    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });
});
