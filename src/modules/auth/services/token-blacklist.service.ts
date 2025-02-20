import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  // Agrega el token a la blacklist con expiración automática
  async addToBlacklist(token: string, expiresIn: number) {
    await this.redisClient.set(token, 'blacklisted', 'EX', expiresIn);
  }

  // Verifica si un token está en la blacklist
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(token);
    return result !== null;
  }
}
