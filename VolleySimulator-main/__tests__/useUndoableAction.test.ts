/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useUndoableAction } from '../app/hooks/useUndoableAction';

describe('useUndoableAction', () => {
  it('should initialize with provided initial state', () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() => useUndoableAction(initialState));
    
    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should update state and allow undo', () => {
    const { result } = renderHook(() => useUndoableAction({ count: 0 }));
    
    act(() => {
      result.current.updateState({ count: 1 });
    });
    
    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('should support redo after undo', () => {
    const { result } = renderHook(() => useUndoableAction({ value: 'a' }));
    
    act(() => {
      result.current.updateState({ value: 'b' });
    });
    
    act(() => {
      result.current.updateState({ value: 'c' });
    });
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.state).toEqual({ value: 'b' });
    
    act(() => {
      result.current.redo();
    });
    
    expect(result.current.state).toEqual({ value: 'c' });
  });

  it('should clear redo stack when new action is performed after undo', () => {
    const { result } = renderHook(() => useUndoableAction({ step: 1 }));
    
    act(() => {
      result.current.updateState({ step: 2 });
    });
    
    act(() => {
      result.current.updateState({ step: 3 });
    });
    
    act(() => {
      result.current.undo(); // back to step 2
    });
    
    act(() => {
      result.current.updateState({ step: 4 }); // new branch
    });
    
    expect(result.current.state).toEqual({ step: 4 });
    expect(result.current.canRedo).toBe(false);
  });

  it('should reset to initial state', () => {
    const initialState = { items: [] as string[] };
    const { result } = renderHook(() => useUndoableAction(initialState));
    
    act(() => {
      result.current.updateState({ items: ['a'] });
    });
    
    act(() => {
      result.current.updateState({ items: ['a', 'b'] });
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.state).toEqual({ items: [] });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
