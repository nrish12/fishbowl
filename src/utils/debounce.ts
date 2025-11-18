export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
}

export function preventDoubleClick<T extends (...args: any[]) => Promise<any>>(
  asyncFunc: T
): T {
  let isExecuting = false;

  return (async (...args: Parameters<T>) => {
    if (isExecuting) {
      return;
    }

    isExecuting = true;
    try {
      return await asyncFunc(...args);
    } finally {
      isExecuting = false;
    }
  }) as T;
}
