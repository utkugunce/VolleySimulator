import { 
  throttle, 
  debounce, 
  memoize 
} from '../app/utils/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('throttle', () => {
    it('should call function immediately on first call', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not call function again within wait period', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      throttled();
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function again after wait period', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      jest.advanceTimersByTime(100);
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should cancel pending calls', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      throttled();
      throttled.cancel();
      jest.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce', () => {
    it('should not call function until wait period has elapsed', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      
      expect(fn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on each call', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call immediately with leading option', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100, { leading: true });
      
      debounced();
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel pending calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      debounced.cancel();
      jest.advanceTimersByTime(100);
      
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('memoize', () => {
    it('should cache results for same arguments', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);
      
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should compute new results for different arguments', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);
      
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(2, 3)).toBe(5);
      
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use custom key resolver', () => {
      const fn = jest.fn((obj: { id: number; value: string }) => obj.value.toUpperCase());
      const memoized = memoize(fn, (obj) => String(obj.id));
      
      expect(memoized({ id: 1, value: 'hello' })).toBe('HELLO');
      expect(memoized({ id: 1, value: 'different' })).toBe('HELLO'); // Cached by id
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
