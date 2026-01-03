/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useUndoableAction } from '../app/hooks/useUndoableAction';

// Mock the Toast context
jest.mock('../app/components/Toast', () => ({
  useToast: () => ({
    showUndoToast: jest.fn((message: string, onUndo: () => void) => {
      // Store the onUndo callback for testing
      (global as unknown as { __lastUndoCallback: () => void }).__lastUndoCallback = onUndo;
    }),
  }),
}));

describe('useUndoableAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with isUndoable as false', () => {
    let storedValue = 'initial';
    const { result } = renderHook(() => useUndoableAction({
      message: 'Action performed',
      onExecute: () => {
        const prev = storedValue;
        storedValue = 'executed';
        return prev;
      },
      onUndo: (prev) => {
        storedValue = prev;
      },
    }));

    expect(result.current.isUndoable).toBe(false);
  });

  it('should execute action and become undoable', () => {
    let storedValue = 'initial';
    const { result } = renderHook(() => useUndoableAction({
      message: 'Action performed',
      onExecute: () => {
        const prev = storedValue;
        storedValue = 'executed';
        return prev;
      },
      onUndo: (prev) => {
        storedValue = prev;
      },
    }));

    act(() => {
      result.current.execute();
    });

    expect(storedValue).toBe('executed');
    expect(result.current.isUndoable).toBe(true);
  });

  it('should undo action and restore previous state', () => {
    let storedValue = 'initial';
    const { result } = renderHook(() => useUndoableAction({
      message: 'Action performed',
      onExecute: () => {
        const prev = storedValue;
        storedValue = 'executed';
        return prev;
      },
      onUndo: (prev) => {
        storedValue = prev;
      },
    }));

    act(() => {
      result.current.execute();
    });

    expect(storedValue).toBe('executed');

    act(() => {
      result.current.undo();
    });

    expect(storedValue).toBe('initial');
    expect(result.current.isUndoable).toBe(false);
  });

  it('should clear undo ability after duration', () => {
    let storedValue = 'initial';
    const { result } = renderHook(() => useUndoableAction({
      message: 'Action performed',
      duration: 5000,
      onExecute: () => {
        const prev = storedValue;
        storedValue = 'executed';
        return prev;
      },
      onUndo: (prev) => {
        storedValue = prev;
      },
    }));

    act(() => {
      result.current.execute();
    });

    expect(result.current.isUndoable).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isUndoable).toBe(false);
  });

  it('should work with complex state objects', () => {
    let predictions: Record<string, string> = { match1: '3-0', match2: '3-1' };
    const { result } = renderHook(() => useUndoableAction({
      message: 'Predictions cleared',
      onExecute: () => {
        const prev = { ...predictions };
        predictions = {};
        return prev;
      },
      onUndo: (prev) => {
        predictions = prev;
      },
    }));

    act(() => {
      result.current.execute();
    });

    expect(predictions).toEqual({});

    act(() => {
      result.current.undo();
    });

    expect(predictions).toEqual({ match1: '3-0', match2: '3-1' });
  });
});
