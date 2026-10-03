import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { createHash } from 'crypto';

export interface CacheKeyOptions {
  useCase: 'chat' | 'explain' | 'scheme-instructions' | 'eligibility-validation';
  userId?: string;
  schemeId?: string;
  minimizedProfileHash?: string;
  language?: string;
  promptVersion?: string;
  normalizedPrompt?: string;
  schemeRuleHash?: string;
}

export interface CachedAiResult {
  content: string;
  provider: string;
  isCached: boolean;
  cachedAt?: Date;
  expiresAt?: Date;
  metrics?: {
    totalDurationMs: number;
    cacheLookupMs: number;
    lockAcquisitionMs: number;
    aiProviderMs: number;
    dbWriteMs: number;
  };
}

@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);
  private inFlightRequests = new Map<string, Promise<CachedAiResult>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  public generateCacheKey(options: CacheKeyOptions): string {
    const userDiscriminator = options.userId ? `usr_${options.userId}` : 'anon';
    const parts = [
      options.useCase,
      userDiscriminator,
      options.schemeId || 'none',
      options.schemeRuleHash || 'norules',
      options.minimizedProfileHash || 'noprofilehash',
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
          // Mark expired asynchronously without blocking
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
    let cacheLookupMs = 0;
    let lockAcquisitionMs = 0;
    let aiProviderMs = 0;
    let dbWriteMs = 0;

    const cacheKey = this.generateCacheKey(cacheKeyOptions);

    // 1. Check database cache
    const lookupStart = Date.now();
    const cached = await this.getCachedResponse(cacheKey);
    cacheLookupMs = Date.now() - lookupStart;

    if (cached) {
      const totalDurationMs = Date.now() - startTime;
      this.logger.log(
        `AI Cache HIT [useCase: ${cacheKeyOptions.useCase}, lang: ${cacheKeyOptions.language || 'en'}, duration: ${totalDurationMs}ms]`,
      );
      return {
        ...cached,
        metrics: {
          totalDurationMs,
          cacheLookupMs,
          lockAcquisitionMs: 0,
          aiProviderMs: 0,
          dbWriteMs: 0,
        },
      };
    }

    // 2. Request deduplication (Local in-flight fast-path)
    const existingInFlight = this.inFlightRequests.get(cacheKey);
    if (existingInFlight) {
      this.logger.log(`AI Request In-Flight Local Deduplication HIT [useCase: ${cacheKeyOptions.useCase}]`);
      return await existingInFlight;
    }

    // Wrap execution inside the in-flight Promise registered immediately
    const executionPromise = (async (): Promise<CachedAiResult> => {
      // 3. Distributed Lock Acquisition (Multi-Instance Coordination)
      const lockKey = `lock:ai:${cacheKey}`;
      const lockStart = Date.now();
      let lockToken: string | null = null;
      try {
        lockToken = await this.redis.acquireLock(lockKey, 15);
      } catch (err: any) {
        this.logger.warn(`Redis lock acquire error: ${err.message}. Proceeding with local execution.`);
      }
      lockAcquisitionMs = Date.now() - lockStart;

      // If lock is held by another instance/thread, wait and poll for cached result
      if (!lockToken) {
        this.logger.log(
          `AI Request Distributed Contention — Waiting for active worker [useCase: ${cacheKeyOptions.useCase}]`,
        );
        const pollStart = Date.now();
        const maxPollMs = 10000;
        const pollIntervalMs = 100;

        while (Date.now() - pollStart < maxPollMs) {
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
          const polledResult = await this.getCachedResponse(cacheKey);
          if (polledResult) {
            const totalDurationMs = Date.now() - startTime;
            this.logger.log(
              `AI Request Distributed Poll Resolved [useCase: ${cacheKeyOptions.useCase}, duration: ${totalDurationMs}ms]`,
            );
            return {
              ...polledResult,
              metrics: {
                totalDurationMs,
                cacheLookupMs,
                lockAcquisitionMs,
                aiProviderMs: 0,
                dbWriteMs: 0,
              },
            };
          }
        }
        this.logger.warn(`Distributed lock wait timed out for key ${cacheKey.substring(0, 12)}... Executing directly.`);
      }

      // 4. Execute generator with in-flight protection & lock release
      try {
        // Double-check cache in case it was written during lock acquisition
        const doubleCheck = await this.getCachedResponse(cacheKey);
        if (doubleCheck) {
          return doubleCheck;
        }

        const genStart = Date.now();
        const result = await generatorFn();
        aiProviderMs = Date.now() - genStart;

        if (result && result.content && result.content.trim().length > 0) {
          const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

          const dbWriteStart = Date.now();
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
          dbWriteMs = Date.now() - dbWriteStart;

          const totalDurationMs = Date.now() - startTime;
          this.logger.log(
            `AI Cache MISS & STORED [useCase: ${cacheKeyOptions.useCase}, lang: ${cacheKeyOptions.language || 'en'}, duration: ${totalDurationMs}ms]`,
          );

          return {
            content: result.content,
            provider: 'BenefitOS AI',
            isCached: false,
            expiresAt,
            metrics: {
              totalDurationMs,
              cacheLookupMs,
              lockAcquisitionMs,
              aiProviderMs,
              dbWriteMs,
            },
          };
        } else {
          return {
            content: result?.content || '',
            provider: 'BenefitOS AI',
            isCached: false,
            metrics: {
              totalDurationMs: Date.now() - startTime,
              cacheLookupMs,
              lockAcquisitionMs,
              aiProviderMs,
              dbWriteMs: 0,
            },
          };
        }
      } catch (err: any) {
        this.logger.error(`AI Generator execution failed: ${err.message}`);
        throw err;
      } finally {
        this.inFlightRequests.delete(cacheKey);
        if (lockToken) {
          try {
            await this.redis.releaseLock(lockKey, lockToken);
          } catch (err: any) {
            this.logger.warn(`Failed to release distributed lock ${lockKey}: ${err.message}`);
          }
        }
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
