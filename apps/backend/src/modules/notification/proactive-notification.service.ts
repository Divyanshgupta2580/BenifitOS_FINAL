import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';
import { EligibilityEvaluatorService } from '../recommendation/services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from '../recommendation/services/eligibility-ai-validator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity } from '../../domain/welfare/scheme.entity';
import { createHash } from 'crypto';

@Injectable()
export class ProactiveNotificationService {
  private readonly logger = new Logger(ProactiveNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly evaluator: EligibilityEvaluatorService,
    private readonly aiValidator: EligibilityAiValidatorService,
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
  ) {}

  /**
   * Generates a deterministic version hash for a scheme based on its rules and requirements.
   */
  computeSchemeVersionHash(scheme: WelfareSchemeEntity): string {
    const raw = `${scheme.code}:${scheme.title}:${scheme.financialBenefit}:${JSON.stringify(scheme.eligibilityRules)}:${JSON.stringify(scheme.requiredDocuments)}`;
    return createHash('sha256').update(raw).digest('hex').substring(0, 16);
  }

  /**
   * Generates a deterministic hash of citizen's relevant attributes.
   */
  computeProfileHash(citizen: CitizenEntity): string {
    const raw = `${citizen.id}:${citizen.employmentStatus}:${citizen.annualIncomeINR}:${citizen.socialCategory}:${citizen.isBplCardHolder}:${citizen.address?.state}:${citizen.address?.isRural}`;
    return createHash('sha256').update(raw).digest('hex').substring(0, 16);
  }

  /**
   * 1. Evaluates all registered citizens when a genuinely new scheme is added or significantly updated.
   */
  async evaluateNewSchemeForCitizens(scheme: WelfareSchemeEntity, schemeVersionHash?: string): Promise<number> {
    const versionHash = schemeVersionHash || this.computeSchemeVersionHash(scheme);
    this.logger.log(`Evaluating new scheme '${scheme.title}' (${scheme.code}) for all active citizens [version: ${versionHash}]...`);

    const citizens = await this.citizenRepo.findAll();
    let notifiedCount = 0;

    for (const citizen of citizens) {
      try {
        // 1. Deterministic evaluation
        const detailed = this.evaluator.evaluateDetailedEligibility(citizen, scheme);

        // Fail-closed: Must satisfy ALL non-document criteria
        if (detailed.eligibilityStatus !== 'ELIGIBLE' || detailed.missingProfileFields.length > 0) {
          continue;
        }

        // 2. Second-layer Gemini validation
        const aiVal = await this.aiValidator.validateEligibility(citizen, scheme, detailed);

        if (
          aiVal.decision === 'CLAIM_READY' &&
          aiVal.allNonDocumentCriteriaSatisfied === true &&
          aiVal.onlyDocumentsRemaining === true
        ) {
          // Check if citizen has missing required documents
          const requiredDocs = scheme.requiredDocuments || [];
          const userDocs = await this.prisma.client.document.findMany({
            where: { userId: citizen.userId, verificationStatus: { not: 'REJECTED' } },
          });
          const userDocTypes = new Set(userDocs.map((d: { documentType: string }) => d.documentType));
          const missingDocTypes = requiredDocs.filter((reqDoc) => !userDocTypes.has(reqDoc));

          if (missingDocTypes.length > 0) {
            // Missing documents -> DOCUMENT_REQUIRED notification
            const dedupKey = `${citizen.userId}:${scheme.id}:DOCUMENT_REQUIRED:${versionHash}`;
            const docNames = missingDocTypes.map((d) => d.replace(/_/g, ' ')).join(', ');

            await this.notificationService.createNotification({
              userId: citizen.userId,
              type: NotificationType.DOCUMENT_REQUIRED,
              title: `Documents required: ${scheme.title}`,
              body: `You're eligible for ${scheme.title}, but you still need to upload the required documents (${docNames}).`,
              severity: NotificationSeverity.WARNING,
              metadata: {
                schemeId: scheme.id,
                schemeCode: scheme.code,
                schemeName: scheme.title,
                missingDocumentIds: missingDocTypes,
                destination: `/schemes/${scheme.id}`,
              },
              dedupKey,
            });
            notifiedCount++;
          } else {
            // All documents ready -> NEW_SCHEME_ELIGIBLE notification
            const dedupKey = `${citizen.userId}:${scheme.id}:NEW_SCHEME_ELIGIBLE:${versionHash}`;

            await this.notificationService.createNotification({
              userId: citizen.userId,
              type: NotificationType.NEW_SCHEME_ELIGIBLE,
              title: `New Scheme Available: ${scheme.title}`,
              body: `A new government scheme is available and you are claim-ready for ₹${scheme.financialBenefit.toLocaleString('en-IN')}/year benefits.`,
              severity: NotificationSeverity.SUCCESS,
              metadata: {
                schemeId: scheme.id,
                schemeCode: scheme.code,
                schemeName: scheme.title,
                destination: `/schemes/${scheme.id}`,
              },
              dedupKey,
            });
            notifiedCount++;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Error evaluating citizen ${citizen.id} for new scheme ${scheme.code}: ${err?.message}`);
      }
    }

    this.logger.log(`New scheme '${scheme.code}' evaluation completed. Notified ${notifiedCount} eligible citizens.`);
    return notifiedCount;
  }

  /**
   * 2. Evaluates citizens who have reached or crossed age thresholds for age-gated schemes.
   */
  async evaluateAgeThresholds(): Promise<number> {
    this.logger.log('Evaluating age-based eligibility thresholds across canonical schemes...');
    const schemes = await this.schemeRepo.findAllActive();
    const citizens = await this.citizenRepo.findAll();
    let notifiedCount = 0;

    for (const scheme of schemes) {
      // Find if scheme has minimum age rules
      const ageRule = scheme.eligibilityRules.find(
        (r) => r.attributeKey === 'age' && (r.operator === 'GREATER_EQUAL' || r.operator === 'GREATER_THAN'),
      );
      if (!ageRule) continue;

      const minAge = parseInt(ageRule.targetValue, 10);
      if (isNaN(minAge)) continue;

      const versionHash = this.computeSchemeVersionHash(scheme);

      for (const citizen of citizens) {
        const citizenAge = citizen.age;
        // Check if citizen is at or above minimum age
        if (citizenAge < minAge) continue;

        const dedupKey = `${citizen.userId}:${scheme.id}:AGE_ELIGIBILITY_REACHED:${versionHash}`;

        // Check if this notification has already been sent
        const alreadySent = await this.prisma.client.notification.findFirst({
          where: { userId: citizen.userId, dedupKey },
        });
        if (alreadySent) continue;

        // Run full deterministic evaluation across ALL criteria (income, employment, rural status, etc.)
        const detailed = this.evaluator.evaluateDetailedEligibility(citizen, scheme);
        if (detailed.eligibilityStatus !== 'ELIGIBLE' || detailed.missingProfileFields.length > 0) {
          continue;
        }

        // Run Gemini second-layer validator
        const aiVal = await this.aiValidator.validateEligibility(citizen, scheme, detailed);
        if (
          aiVal.decision === 'CLAIM_READY' &&
          aiVal.allNonDocumentCriteriaSatisfied === true &&
          aiVal.onlyDocumentsRemaining === true
        ) {
          await this.notificationService.createNotification({
            userId: citizen.userId,
            type: NotificationType.AGE_ELIGIBILITY_REACHED,
            title: `You're now eligible for ${scheme.title}`,
            body: `You're now old enough to qualify for ${scheme.title}. Check your eligibility and required documents.`,
            severity: NotificationSeverity.SUCCESS,
            metadata: {
              schemeId: scheme.id,
              schemeCode: scheme.code,
              schemeName: scheme.title,
              destination: `/schemes/${scheme.id}`,
            },
            dedupKey,
          });
          notifiedCount++;
        }
      }
    }

    this.logger.log(`Age threshold evaluation completed. Notified ${notifiedCount} citizens.`);
    return notifiedCount;
  }

  /**
   * 3. Detects meaningful profile change transitions (e.g. NOT_ELIGIBLE -> CLAIM_READY).
   */
  async notifyProfileEligibilityTransition(
    citizen: CitizenEntity,
    scheme: WelfareSchemeEntity,
    previousStatus: string | null,
    currentStatus: string,
  ): Promise<void> {
    const isTransitionToEligible =
      (previousStatus === 'NOT_ELIGIBLE' || previousStatus === 'INSUFFICIENT_DATA' || previousStatus === 'PARTIALLY_ELIGIBLE' || !previousStatus) &&
      currentStatus === 'CLAIM_READY';

    if (!isTransitionToEligible) return;

    const profileHash = this.computeProfileHash(citizen);
    const dedupKey = `${citizen.userId}:${scheme.id}:BECAME_ELIGIBLE:${profileHash}`;

    await this.notificationService.createNotification({
      userId: citizen.userId,
      type: NotificationType.BECAME_ELIGIBLE,
      title: `You're now eligible for ${scheme.title}`,
      body: `Based on your updated profile details, you now qualify for ${scheme.title} (₹${scheme.financialBenefit.toLocaleString('en-IN')}/year).`,
      severity: NotificationSeverity.SUCCESS,
      metadata: {
        schemeId: scheme.id,
        schemeCode: scheme.code,
        schemeName: scheme.title,
        destination: `/schemes/${scheme.id}`,
      },
      dedupKey,
    });
  }

  /**
   * 4. Dispatches APPLICATION_READY when all required documents for an eligible scheme are uploaded.
   */
  async notifyApplicationReadyIfComplete(userId: string, scheme: WelfareSchemeEntity): Promise<void> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) return;

    const requiredDocs = scheme.requiredDocuments || [];
    if (requiredDocs.length === 0) return;

    const userDocs = await this.prisma.client.document.findMany({
      where: { userId, verificationStatus: { not: 'REJECTED' } },
    });
    const userDocTypes = new Set(userDocs.map((d: { documentType: string }) => d.documentType));
    const allUploaded = requiredDocs.every((reqDoc) => userDocTypes.has(reqDoc));

    if (allUploaded) {
      const dedupKey = `${userId}:${scheme.id}:APPLICATION_READY:${requiredDocs.sort().join('_')}`;
      await this.notificationService.createNotification({
        userId,
        type: NotificationType.APPLICATION_READY,
        title: `Your application is ready for ${scheme.title}`,
        body: `All required documents for ${scheme.title} are uploaded. You can now review and submit your application.`,
        severity: NotificationSeverity.SUCCESS,
        metadata: {
          schemeId: scheme.id,
          schemeCode: scheme.code,
          schemeName: scheme.title,
          destination: `/applications/new?schemeId=${scheme.id}`,
        },
        dedupKey,
      });
    }
  }

  /**
   * 5. Dispatches DOCUMENT_REJECTED notification when a document is rejected.
   */
  async notifyDocumentRejected(userId: string, documentType: string, reason?: string): Promise<void> {
    const docName = documentType.replace(/_/g, ' ');
    await this.notificationService.createNotification({
      userId,
      type: NotificationType.DOCUMENT_REJECTED,
      title: `Document action required: ${docName}`,
      body: `Your uploaded ${docName} could not be verified. ${reason ? `Reason: ${reason}` : 'Please re-upload a clear copy.'}`,
      severity: NotificationSeverity.ERROR,
      metadata: {
        documentType,
        reason,
        destination: '/documents',
      },
      deduplicateMinutes: 60,
    });
  }
}
