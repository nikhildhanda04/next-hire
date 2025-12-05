type RateLimitStore = Map<string, { count: number; expiresAt: number }>;

const store: RateLimitStore = new Map();

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

export function rateLimit(key: string, config: RateLimitConfig = { limit: 10, windowMs: 60000 }) {
    const now = Date.now();
    const record = store.get(key);

    // Clean up expired entries (naive cleanup)
    if (record && record.expiresAt < now) {
        store.delete(key);
    }

    // Get fresh record
    const currentRecord = store.get(key) || { count: 0, expiresAt: now + config.windowMs };

    if (currentRecord.count >= config.limit) {
        return { success: false, limit: config.limit, remaining: 0, reset: currentRecord.expiresAt };
    }

    currentRecord.count += 1;
    store.set(key, currentRecord);

    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - currentRecord.count,
        reset: currentRecord.expiresAt
    };
}
