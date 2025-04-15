import { Redis } from 'ioredis';
declare global {
    var redisClient: Redis | null;
}
