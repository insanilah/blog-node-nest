import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: 'localhost', // Host Redis (or Redis URL if using Redis cloud)
            port: 6379,        // Redis port (default is 6379)
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
