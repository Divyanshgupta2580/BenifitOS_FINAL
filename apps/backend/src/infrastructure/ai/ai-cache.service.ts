import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { createHash } from 'crypto';

export interface CacheKeyOptions {
  useCase: 'chat' | 'explain' | 'scheme-instructions';
  userId?: string;
  schemeId?: string;
  minimizedProfileHash?: string;
  language?: string;
  promptVersion?: string;
  normalizedPrompt?: string;
}

export interface CachedAiResult {
  content: string;
  provider: string;
  isCached: boolean;
  cachedAt?: Date;
  expiresAt?: Date;
}

@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);
  private inFlightRequests = new Map<string, Promise<CachedAiResult>>();

  constructor(private readonly prisma: PrismaService) {}

  public generateCacheKey(options: CacheKeyOptions): string {
    const parts = [
      options.useCase,
      options.schemeId || 'none',
      options.minimizedProfileHash || (options.userId ? `usr_${options.userId}` : 'anon'),
      (options.language || 'en').toLowerCase().trim(),
      options.promptVersion || 'v1.0',
      options.normalizedPrompt ? options.normalizedPrompt.toLowerCase().replace(/\s+/g, ' ').trim() : 'noprompt',
    ];
    return createHash('sha256').update(parts.join('::')).digest('hex');
  }

  public async getCachedResponse(cacheKey: string): Promise<CachedAiResult | null> {
    try {
      const entry = await this.prisma.client.aiResponseCache.findUnique({
        where: { cacheKey },
      });

      if (!entry) {
        return null;
      }

      if (entry.status !== 'ACTIVE' || entry.expiresAt < new Date()) {
        if (entry.status === 'ACTIVE') {
          // Mark expired asynchronously
          this.prisma.client.aiResponseCache
            .update({
              where: { id: entry.id },
              data: { status: 'EXPIRED' },
            })
            .catch((err) => this.logger.warn(`Failed to mark cache expired: ${err.message}`));
        }
        return null;
      }

      return {
        content: entry.response,
        provider: 'BenefitOS AI',
        isCached: true,
        cachedAt: entry.createdAt,
        expiresAt: entry.expiresAt,
      };
    } catch (err: any) {
      this.logger.warn(`Cache lookup error for key ${cacheKey.substring(0, 12)}...: ${err.message}`);
      return null;
    }
  }

  public async getOrExecute(
    cacheKeyOptions: CacheKeyOptions,
    generatorFn: () => Promise<{ content: string; provider?: string }>,
    ttlHours = 24,
  ): Promise<CachedAiResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(cacheKeyOptions);

    // 1. Check database cache
    const cached = await this.getCachedResponse(cacheKey);
    if (cached) {
      const durationMs = Date.now() - startTime;
      this.logger.log(
        `AI Cache HIT [useCase: ${cacheKeyOptions.useCase}, lang: ${cacheKeyOptions.language || 'en'}, duration: ${durationMs}ms]`,
      );
      return cached;
    }

    // 2. Request deduplication (in-flight Promise cache)
    const existingInFlight = this.inFlightRequests.get(cacheKey);
    if (existingInFlight) {
      this.logger.log(`AI Request In-Flight Deduplication HIT [useCase: ${cacheKeyOptions.useCase}]`);
      return await existingInFlight;
    }

    // 3. Execute generator with in-flight protection
    const executionPromise = (async () => {
      try {
        const result = await generatorFn();
        const durationMs = Date.now() - startTime;

        if (result && result.content && result.content.trim().length > 0) {
          const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
          
          // Save to database
          await this.prisma.client.aiResponseCache.upsert({
            where: { cacheKey },
            create: {
              cacheKey,
              userId: cacheKeyOptions.userId,
              schemeId: cacheKeyOptions.schemeId,
              useCase: cacheKeyOptions.useCase,
              response: result.content,
              language: cacheKeyOptions.language || 'en',
              promptVersion: cacheKeyOptions.promptVersion || 'v1.0',
              status: 'ACTIVE',
              expiresAt,
            },
            update: {
              response: result.content,
              status: 'ACTIVE',
              expiresAt,
              invalidatedAt: null,
            },
          });

          this.logger.log(
            `AI Cache MISS & STORED [useCase: ${cacheKeyOptions.useCase}, lang: ${cacheKeyOptions.language || 'en'}, duration: ${durationMs}ms]`,
          );

          return {
            content: result.content,
            provider: 'BenefitOS AI',
            isCached: false,
            expiresAt,
          };
        } else {
          return {
            content: result?.content || '',
            provider: 'BenefitOS AI',
            isCached: false,
          };
        }
      } catch (err: any) {
        this.logger.error(`AI Generator execution failed: ${err.message}`);
        throw err;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, executionPromise);
    return await executionPromise;
  }

  public async invalidateForUser(userId: string): Promise<number> {
    try {
      const res = await this.prisma.client.aiResponseCache.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'INVALIDATED', invalidatedAt: new Date() },
      });
      this.logger.log(`Invalidated ${res.count} AI cache entries for user ${userId}`);
      return res.count;
    } catch (err: any) {
      this.logger.warn(`Could not invalidate user AI cache: ${err.message}`);
      return 0;
    }
  }

  public async invalidateForScheme(schemeId: string): Promise<number> {
    try {
      const res = await this.prisma.client.aiResponseCache.updateMany({
        where: { schemeId, status: 'ACTIVE' },
        data: { status: 'INVALIDATED', invalidatedAt: new Date() },
      });
      this.logger.log(`Invalidated ${res.count} AI cache entries for scheme ${schemeId}`);
      return res.count;
    } catch (err: any) {
      this.logger.warn(`Could not invalidate scheme AI cache: ${err.message}`);
      return 0;
    }
  }
}
