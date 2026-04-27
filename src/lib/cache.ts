import { redis } from './redis.js'

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // cache failure should never break the request
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys)
  } catch {}
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch {}
}
