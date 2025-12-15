import { prisma } from '@/lib/prisma';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

export async function rateLimit(key: string, config: RateLimitConfig = { limit: 10, windowMs: 60000 }) {
    const now = new Date();

    const record = await prisma.rateLimit.findUnique({
        where: { key }
    });

    if (record) {
        if (record.expiresAt < now) {
            // Expired, reset
            const newRecord = await prisma.rateLimit.update({
                where: { key },
                data: {
                    count: 1,
                    expiresAt: new Date(now.getTime() + config.windowMs)
                }
            });
            return { success: true, limit: config.limit, remaining: config.limit - 1, reset: newRecord.expiresAt.getTime() };
        } else if (record.count >= config.limit) {
            return { success: false, limit: config.limit, remaining: 0, reset: record.expiresAt.getTime() };
        } else {
            // Increment
            const newRecord = await prisma.rateLimit.update({
                where: { key },
                data: {
                    count: record.count + 1
                }
            });
            return { success: true, limit: config.limit, remaining: config.limit - newRecord.count, reset: newRecord.expiresAt.getTime() };
        }
    } else {
        // Create
        const newRecord = await prisma.rateLimit.create({
            data: {
                key,
                count: 1,
                expiresAt: new Date(now.getTime() + config.windowMs)
            }
        });
        return { success: true, limit: config.limit, remaining: config.limit - 1, reset: newRecord.expiresAt.getTime() };
    }
}
