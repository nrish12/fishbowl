interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

export class TimeoutError extends Error {
  name = 'TimeoutError';
  constructor(message = 'Request timeout - please try again') {
    super(message);
  }
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, signal: externalSignal, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const handleExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', handleExternalAbort);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw error;
      }
      throw new TimeoutError();
    }

    if (!navigator.onLine) {
      throw new Error('No internet connection - please check your network');
    }

    throw error;
  } finally {
    externalSignal?.removeEventListener('abort', handleExternalAbort);
  }
}

export async function retryFetch(
  url: string,
  options: FetchWithTimeoutOptions = {},
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }

      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}
