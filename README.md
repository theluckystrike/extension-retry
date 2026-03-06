# extension-retry

Retry logic for Chrome extensions with exponential backoff, linear delay, constant delay, jitter, timeout handling, and abort signal support for Manifest V3.

[![npm](https://img.shields.io/npm/v/extension-retry.svg)](https://www.npmjs.com/package/extension-retry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

## INSTALL

```bash
npm install extension-retry
```

## QUICK START

```typescript
import { Retry } from 'extension-retry';

// Retry a function
const data = await Retry.run(() => fetchAPI(), { 
    maxAttempts: 5, 
    backoff: 'exponential', 
    jitter: true 
});

// Retry a fetch request
const res = await Retry.fetch('https://api.example.com/data', {}, { 
    maxAttempts: 3 
});

// Wrap an unreliable function
const safeFn = Retry.wrap(unreliableFunction, { 
    maxAttempts: 3 
});
```

## FEATURES

### Backoff Strategies

```typescript
import { Retry } from 'extension-retry';

// Exponential backoff (default): 1s, 2s, 4s, 8s, 16s...
await Retry.run(fn, { backoff: 'exponential' });

// Linear backoff: 1s, 2s, 3s, 4s, 5s...
await Retry.run(fn, { backoff: 'linear' });

// Constant backoff: 1s, 1s, 1s, 1s, 1s...
await Retry.run(fn, { backoff: 'constant' });
```

### Jitter

Add randomness to prevent thundering herd:

```typescript
await Retry.run(fn, { jitter: true });
// Delays might become: 1.2s, 2.1s, 3.8s...
```

### Timeout

Auto-cancel after duration:

```typescript
await Retry.run(fn, { timeout: 5000 }); // Cancel after 5 seconds
```

### Fetch Wrapper

Automatically retry failed requests:

```typescript
const res = await Retry.fetch(url, options, {
    maxAttempts: 3,
    backoff: 'exponential'
});
```

### Function Wrapper

Make any function reliable:

```typescript
const safeGetUser = Retry.wrap(getUser, {
    maxAttempts: 3,
    onRetry: (attempt, error) => {
        console.log(`Retry ${attempt}: ${error.message}`);
    }
});
```

### Custom Retry Conditions

Control which errors trigger a retry:

```typescript
await Retry.run(fn, {
    retryOn: (error) => {
        // Retry only on network errors or 5xx responses
        return error.name === 'NetworkError' || error.status >= 500;
    }
});
```

## API REFERENCE

### RetryOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| maxAttempts | number | 3 | Maximum retry attempts |
| initialDelay | number | 1000 | Initial delay in milliseconds |
| maxDelay | number | 30000 | Maximum delay in milliseconds |
| backoff | 'exponential' \| 'linear' \| 'constant' | 'exponential' | Backoff strategy |
| jitter | boolean | true | Add randomness to delays |
| timeout | number | undefined | Timeout in milliseconds |
| retryOn | (error: any) => boolean | undefined | Custom retry condition |
| onRetry | (attempt: number, error: any) => void | undefined | Callback on each retry |

### Retry.run(fn, options)

Executes an async function with retry logic. Returns a Promise that resolves with the function's result or rejects with the last error after all attempts are exhausted.

### Retry.fetch(url, init, options)

Wraps the fetch API with automatic retry logic. Automatically retries on HTTP 5xx errors and network TypeErrors.

### Retry.wrap(fn, options)

Creates a retry-wrapped version of any async function. Useful for creating reliable versions of unreliable APIs.

### Retry.withTimeout(promise, ms)

Adds a timeout to any promise. Rejects with a timeout error if the promise does not resolve within the specified milliseconds.

### Retry.sleep(ms)

A simple promise-based sleep utility. Resolves after the specified milliseconds.

## ABOUT

extension-retry is maintained by theluckystrike and built for Chrome extension developers who need reliable retry logic in their extensions. The library is designed to work seamlessly with Manifest V3 and has zero runtime dependencies.

For issues and contributions, please visit the GitHub repository.

## LICENSE

MIT License
