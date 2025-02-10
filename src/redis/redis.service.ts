import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost', // Gunakan default jika tidak ada
            port: Number(process.env.REDIS_PORT) || 6379, // Pastikan pakai REDIS_PORT
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    // Explicitly specify `EX` as the mode for expiration in seconds
    async set(key: string, value: string, expirationTimeInSeconds: number): Promise<'OK'> {
        return await this.redisClient.set(key, value, 'EX', expirationTimeInSeconds);
    }

    async onModuleDestroy() {
        await this.redisClient.quit();
    }
}
