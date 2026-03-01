/**
 * Retry — Resilient async operations with backoff strategies
 */
export interface RetryOptions {
    maxAttempts?: number; initialDelay?: number; maxDelay?: number;
    backoff?: 'exponential' | 'linear' | 'constant';
    jitter?: boolean; timeout?: number;
    retryOn?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
}

export class Retry {
    /** Execute function with retry logic */
    static async run<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
        const { maxAttempts = 3, initialDelay = 1000, maxDelay = 30000,
            backoff = 'exponential', jitter = true, timeout,
            retryOn, onRetry } = options;

        let lastError: any;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (timeout) {
                    return await Retry.withTimeout(fn(), timeout);
                }
                return await fn();
            } catch (error) {
                lastError = error;
                if (retryOn && !retryOn(error)) throw error;
                if (attempt === maxAttempts) throw error;
                onRetry?.(attempt, error);

                let delay: number;
                switch (backoff) {
                    case 'exponential': delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay); break;
                    case 'linear': delay = Math.min(initialDelay * attempt, maxDelay); break;
                    default: delay = initialDelay;
                }
                if (jitter) delay = delay * (0.5 + Math.random() * 0.5);
                await Retry.sleep(delay);
            }
        }
        throw lastError;
    }

    /** Retry fetch with same options */
    static async fetch(url: string, init?: RequestInit, options?: RetryOptions): Promise<Response> {
        return Retry.run(async () => {
            const response = await fetch(url, init);
            if (!response.ok && response.status >= 500) throw new Error(`HTTP ${response.status}`);
            return response;
        }, { retryOn: (e) => e.message?.startsWith('HTTP 5') || e.name === 'TypeError', ...options });
    }

    /** Add timeout to a promise */
    static withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return Promise.race([
            promise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
        ]);
    }

    /** Sleep helper */
    static sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }

    /** Create a retry-wrapped version of any async function */
    static wrap<T extends (...args: any[]) => Promise<any>>(fn: T, options?: RetryOptions): T {
        return ((...args: any[]) => Retry.run(() => fn(...args), options)) as T;
    }
}
