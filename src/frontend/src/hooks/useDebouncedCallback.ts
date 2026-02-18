import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that returns a debounced version of the provided callback.
 * The debounced function will only execute after the specified delay
 * has passed since the last invocation.
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array that will cancel pending calls when changed
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel pending timeout when deps change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, deps);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );
}
