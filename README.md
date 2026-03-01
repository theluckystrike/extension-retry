# extension-retry — Retry with Backoff
> **Built by [Zovo](https://zovo.one)** | `npm i extension-retry`

Exponential, linear, and constant backoff with jitter, timeout, fetch wrapper, and function wrapping.

```typescript
import { Retry } from 'extension-retry';
const data = await Retry.run(() => fetchAPI(), { maxAttempts: 5, backoff: 'exponential', jitter: true });
const res = await Retry.fetch('https://api.example.com/data', {}, { maxAttempts: 3 });
const safeFn = Retry.wrap(unreliableFunction, { maxAttempts: 3 });
```
MIT License
