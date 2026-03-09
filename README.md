# extension-retry

<p align="center">
  <img src="https://img.shields.io/npm/v/extension-retry.svg" alt="npm version">
  <img src="https://img.shields.io/npm/dm/extension-retry.svg" alt="npm downloads">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/dependencies-0-green.svg" alt="Zero Dependencies">
</p>

> Retry logic for Chrome extensions with exponential backoff, linear delay, constant delay, jitter, timeout handling, and abort signal support for Manifest V3.

**extension-retry** is a zero-dependendency TypeScript library designed specifically for Chrome extension developers who need reliable, resilient retry logic in their extensions. Built for Manifest V3 compatibility with full TypeScript support.

---

## Features

| Feature | Description |
|---------|-------------|
| **Exponential Backoff** | Double delay after each retry: 1s → 2s → 4s → 8s → 16s... |
| **Linear Backoff** | Linear delay growth: 1s → 2s → 3s → 4s → 5s... |
| **Constant Delay** | Fixed delay between retries: 1s → 1s → 1s → 1s... |
| **Jitter** | Randomization to prevent thundering herd problems |
| **Max Retries** | Configurable maximum attempt count |
| **Timeout** | Auto-cancel operations after specified duration |
| **Abort Signal** | Support for AbortController to cancel in-flight requests |
| **Custom Conditions** | Define which errors should trigger a retry |
| **Fetch Wrapper** | Automatic retry for fetch requests |
| **Function Wrapper** | Convert any unreliable function into a reliable one |

---

## Install

```bash
npm install extension-retry
```

### For Chrome Extensions

Import directly in your extension's background script or content script:

```typescript
import { Retry } from 'extension-retry';
```

---

## Quick Start

### Basic Retry

```typescript
import { Retry } from 'extension-retry';

// Retry a function with exponential backoff
const data = await Retry.run(() => fetchAPI(), { 
    maxAttempts: 5, 
    backoff: 'exponential', 
    jitter: true 
});
```

### Retry Fetch Requests

```typescript
// Automatically retry failed API requests
const res = await Retry.fetch('https://api.example.com/data', {}, { 
    maxAttempts: 3,
    backoff: 'exponential',
    timeout: 10000
});

const json = await res.json();
```

### Wrap Unreliable Functions

```typescript
// Create a reliable version of any function
const safeGetUser = Retry.wrap(getUser, { 
    maxAttempts: 3,
    onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} failed: ${error.message}`);
    }
});

const user = await safeGetUser(userId);
```

---

## API Reference

### RetryOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxAttempts` | `number` | `3` | Maximum number of retry attempts |
| `initialDelay` | `number` | `1000` | Initial delay in milliseconds |
| `maxDelay` | `number` | `30000` | Maximum delay cap in milliseconds |
| `backoff` | `'exponential' \| 'linear' \| 'constant'` | `'exponential'` | Backoff strategy |
| `jitter` | `boolean` | `true` | Add randomness to delays (0.5-1.0x) |
| `timeout` | `number` | `undefined` | Timeout in milliseconds |
| `retryOn` | `(error: any) => boolean` | `undefined` | Custom retry condition function |
| `onRetry` | `(attempt: number, error: any) => void` | `undefined` | Callback fired before each retry |

### Retry.run(fn, options)

Executes an async function with retry logic.

```typescript
const result = await Retry.run(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('API failed');
    return response.json();
}, {
    maxAttempts: 5,
    backoff: 'exponential',
    jitter: true,
    timeout: 30000
});
```

**Returns:** `Promise<T>` — Resolves with the function's result or rejects with the last error after all attempts are exhausted.

### Retry.fetch(url, init, options)

Wraps the native fetch API with automatic retry logic.

```typescript
const response = await Retry.fetch('https://api.example.com/data', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' }
}, {
    maxAttempts: 3,
    backoff: 'exponential'
});
```

Automatically retries on:
- HTTP 5xx errors (500, 502, 503, 504, etc.)
- Network TypeErrors (connection failures, DNS errors)

**Returns:** `Promise<Response>`

### Retry.wrap(fn, options)

Creates a retry-wrapped version of any async function.

```typescript
// Original unreliable function
async function getUserData(id: string) {
    const response = await fetch(`/api/users/${id}`);
    if (Math.random() > 0.7) throw new Error('Random failure');
    return response.json();
}

// Wrapped version - now reliable!
const reliableGetUserData = Retry.wrap(getUserData, {
    maxAttempts: 5,
    backoff: 'exponential'
});

// Use it anywhere
const userData = await reliableGetUserData('123');
```

**Returns:** `(...args: any[]) => Promise<T>` — A wrapped function with the same signature.

### Retry.withTimeout(promise, ms)

Adds a timeout to any promise.

```typescript
try {
    const result = await Retry.withTimeout(doSlowOperation(), 5000);
} catch (error) {
    if (error.message.includes('Timeout')) {
        // Handle timeout specifically
    }
}
```

**Returns:** `Promise<T>` — Resolves normally or rejects with TimeoutError.

### Retry.sleep(ms)

A promise-based sleep utility.

```typescript
// Delay execution
await Retry.sleep(2000); // Wait 2 seconds

// Use in loops for polling
while (await checkStatus()) {
    await Retry.sleep(1000);
}
```

**Returns:** `Promise<void>`

---

## Advanced Usage

### Custom Retry Conditions

Control exactly which errors trigger a retry:

```typescript
await Retry.run(fn, {
    retryOn: (error) => {
        // Retry on network errors
        if (error.name === 'NetworkError') return true;
        
        // Retry on specific HTTP status codes
        if (error.status === 429) return true; // Rate limited
        if (error.status >= 500) return true;  // Server errors
        
        // Don't retry on client errors (4xx except 429)
        return false;
    }
});
```

### Custom Backoff Strategies

Implement your own backoff algorithm:

```typescript
// Fibonacci backoff: 1s, 1s, 2s, 3s, 5s, 8s...
let fib = [0, 1];
const fibonacciBackoff = Retry.run(fn, {
    backoff: 'custom',
    // Use onRetry to implement custom delay logic
    onRetry: async (attempt) => {
        fib.push(fib[attempt] + fib[attempt - 1]);
        await Retry.sleep(fib[attempt] * 1000);
    }
});
```

### Timeout with Abort Signal

Use AbortController for finer control over cancellation:

```typescript
const controller = new AbortController();

const result = await Retry.run(async () => {
    const response = await fetch('/api/data', {
        signal: controller.signal
    });
    return response.json();
}, {
    timeout: 10000,
    onRetry: (attempt, error) => {
        if (attempt >= 3) {
            controller.abort(); // Give up after 3 attempts
        }
    }
});
```

### Exponential Backoff with Full Jitter

For maximum protection against thundering herd:

```typescript
await Retry.run(fn, {
    backoff: 'exponential',
    jitter: true,
    initialDelay: 1000,
    maxDelay: 30000
});

// Full jitter formula: random between 0 and calculated delay
// This provides better spread than simple jitter
```

### Circuit Breaker Pattern

Implement a circuit breaker to prevent cascading failures:

```typescript
class CircuitBreaker {
    private failures = 0;
    private lastFailure: number = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    
    constructor(
        private threshold: number = 5,
        private resetTimeout: number = 30000
    ) {}
    
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > this.resetTimeout) {
                this.state = 'half-open';
            } else {
                throw new Error('Circuit breaker is open');
            }
        }
        
        try {
            const result = await Retry.run(fn, {
                maxAttempts: 3,
                backoff: 'exponential'
            });
            this.failures = 0;
            this.state = 'closed';
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailure = Date.now();
            if (this.failures >= this.threshold) {
                this.state = 'open';
            }
            throw error;
        }
    }
}

// Usage
const breaker = new CircuitBreaker();
const data = await breaker.execute(() => fetchAPI());
```

### Polling with Retry

Common pattern for waiting for async operations:

```typescript
async function pollForResult<T>(
    checkFn: () => Promise<T>,
    onSuccess: (result: T) => boolean,
    options: RetryOptions = {}
): Promise<T> {
    return Retry.run(async () => {
        const result = await checkFn();
        if (!onSuccess(result)) {
            throw new Error('Not ready yet');
        }
        return result;
    }, {
        maxAttempts: 30,
        initialDelay: 1000,
        backoff: 'linear',
        ...options
    });
}

// Example: Wait for user data to be ready
const user = await pollForResult(
    () => fetch('/api/users/123').then(r => r.json()),
    (user) => user.status === 'active',
    { timeout: 60000 }
);
```

---

## Browser Compatibility

Tested and working with:

- Chrome 100+ (Manifest V3)
- Firefox 100+
- Edge 100+
- Any browser supporting ES2020 and Fetch API

---

## TypeScript

This library is written in TypeScript with full type definitions included. No additional `@types` packages required.

```typescript
import { Retry, RetryOptions } from 'extension-retry';

const options: RetryOptions = {
    maxAttempts: 5,
    backoff: 'exponential',
    jitter: true
};
```

---

## About

<p align="center">
  <strong>Built with ❤️ by <a href="https://zovo.one">Zovo</a></strong>
</p>

`extension-retry` is maintained by [theluckystrike](https://github.com/theluckystrike) and built for Chrome extension developers who need reliable retry logic in their extensions. The library is designed to work seamlessly with Manifest V3 and has zero runtime dependencies.

### Why Zovo?

Zovo creates tools that make Chrome extension development easier, more reliable, and more enjoyable. This library is part of our commitment to the extension developer community.

### Zero Dependencies

This library has no runtime dependencies. It uses only native browser APIs:
- `setTimeout` for delays
- `Promise` for async operations
- `fetch` for HTTP requests
- `AbortController` for cancellation

This means:
- Smaller bundle size
- No dependency conflicts
- Faster installs
- Better security

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Related

- [extension-storage](https://github.com/theluckystrike/extension-storage) — Promise-based storage API for Chrome extensions
- [extension-messaging](https://github.com/theluckystrike/extension-messaging) — Type-safe messaging between extension contexts
