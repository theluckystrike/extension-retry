# extension-retry — Retry Logic with Backoff

[![npm](https://img.shields.io/npm/v/extension-retry.svg)](https://www.npmjs.com/package/extension-retry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

> **Built by [Zovo](https://zovo.one)** — reliable retries across 18+ Chrome extensions

**Exponential, linear, and constant backoff with jitter, timeout, fetch wrapper, and function wrapping** for Chrome extensions. Zero runtime dependencies.

## 📦 Install

```bash
npm install extension-retry
```

## 🚀 Quick Start

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

## ✨ Features

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
    onRetry: (error, attempt) => {
        console.log(`Retry ${attempt}: ${error.message}`);
    }
});
```

## API Reference

### `Retry.run(fn, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxAttempts` | `number` | `3` | Maximum retry attempts |
| `backoff` | `'exponential' \| 'linear' \| 'constant'` | `'exponential'` | Backoff strategy |
| `delay` | `number` | `1000` | Initial delay in ms |
| `jitter` | `boolean` | `false` | Add randomness |
| `timeout` | `number` | `0` | Total timeout in ms (0 = no timeout) |
| `onRetry` | `function` | - | Called before each retry |

### `Retry.fetch(url, options, retryOptions)`

Wraps `fetch()` with automatic retry.

### `Retry.wrap(fn, options)`

Creates a wrapped function with retry logic.

## 📄 License

MIT — [Zovo](https://zovo.one)
