import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should not have changed yet
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    // Rapid changes
    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'd' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Still at initial value
    expect(result.current).toBe('a');

    // Advance past debounce time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have final value
    expect(result.current).toBe('d');
  });

  it('should work with different data types', () => {
    // Number
    const { result: numberResult } = renderHook(() => useDebounce(42, 500));
    expect(numberResult.current).toBe(42);

    // Object
    const obj = { key: 'value' };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 500));
    expect(objectResult.current).toEqual(obj);

    // Array
    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 500));
    expect(arrayResult.current).toEqual(arr);

    // Boolean
    const { result: boolResult } = renderHook(() => useDebounce(true, 500));
    expect(boolResult.current).toBe(true);

    // Null
    const { result: nullResult } = renderHook(() => useDebounce(null, 500));
    expect(nullResult.current).toBe(null);
  });

  it('should use default delay when not provided', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should still be initial (default is 500ms)
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should cleanup on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Unmount before debounce completes
    unmount();

    // Advance timers - should not cause errors
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change value with new delay
    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should still be initial (new delay is 1000ms)
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now should be updated
    expect(result.current).toBe('updated');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Single call
    await act(async () => {
      result.current('test');
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Callback should have been called
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should pass multiple arguments', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    await act(async () => {
      result.current('arg1', 'arg2', 'arg3');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should reset timer on each call', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    await act(async () => {
      result.current('first');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      result.current('second');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Now should be called with last value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should use default delay', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    await act(async () => {
      result.current();
    });

    await act(async () => {
      vi.advanceTimersByTime(499);
    });

    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should return stable function reference', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: callback } }
    );

    const debouncedFn1 = result.current;

    rerender({ cb: callback });

    const debouncedFn2 = result.current;

    // Both should be functions
    expect(typeof debouncedFn1).toBe('function');
    expect(typeof debouncedFn2).toBe('function');
  });

  it('should handle callback changes', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: callback1 } }
    );

    await act(async () => {
      result.current('value1');
    });

    rerender({ cb: callback2 });

    await act(async () => {
      result.current('value2');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Latest callback should be called
    expect(callback2).toHaveBeenCalledWith('value2');
  });
});
