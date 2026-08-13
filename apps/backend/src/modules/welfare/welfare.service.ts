import { Injectable, Inject, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory, DocumentType } from '../../domain/welfare/scheme.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class WelfareSchemeService implements OnModuleInit {
  private readonly logger = new Logger(WelfareSchemeService.name);

  constructor(
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.client.welfareScheme.count();
      if (count < 6) {
        this.logger.log('Synchronizing official welfare schemes catalog into database...');
        const defaultSchemes = [
          {
            id: 'a1111111-1111-1111-1111-111111111111',
            code: 'PM-KISAN',
            title: 'Pradhan Mantri Kisan Samman Nidhi',
            description: 'Income support of Rs 6,000 per year in three equal installments to all landholding farmer families.',
            category: 'AGRICULTURE' as const,
            department: 'Ministry of Agriculture and Farmers Welfare',
            isCentralScheme: true,
            financialBenefit: 6000.0,
            rules: [
              { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be engaged in farming / agriculture' },
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Annual family income must not exceed Rs 4,00,000' },
            ],
            documents: [
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card for identity verification' },
              { documentType: 'VOTER_ID' as const, isMandatory: true, description: 'Voter ID for electoral residency verification' },
            ],
          },
          {
            id: 'b2222222-2222-2222-2222-222222222222',
            code: 'PMAY-GRAMIN',
            title: 'Pradhan Mantri Awas Yojana (PMAY-G)',
            description: 'Housing assistance grant of up to Rs 1,20,000 to construct pucca houses with basic amenities for eligible households.',
            category: 'HOUSING' as const,
            department: 'Ministry of Rural Development',
            isCentralScheme: true,
            financialBenefit: 120000.0,
            rules: [
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '600000', isRequired: true, description: 'Annual family income must be under Rs 6,00,000' },
              { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be at least 18 years old' },
            ],
            documents: [
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card of head of family' },
              { documentType: 'VOTER_ID' as const, isMandatory: true, description: 'Voter ID proof of residence' },
            ],
          },
          {
            id: 'c3333333-3333-3333-3333-333333333333',
            code: 'PM-VIDYA-SCHOLARSHIP',
            title: 'National Merit-cum-Means Higher Education Scheme',
            description: 'Financial assistance of Rs 48,000 per year for students from economically weaker sections to arrest dropouts.',
            category: 'EDUCATION' as const,
            department: 'Department of Higher Education',
            isCentralScheme: true,
            financialBenefit: 48000.0,
            rules: [
              { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be an enrolled student' },
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '500000', isRequired: true, description: 'Annual parental income must be under Rs 5,00,000' },
            ],
            documents: [
              { documentType: 'EDUCATIONAL_CERTIFICATE' as const, isMandatory: true, description: 'Previous academic marksheet/certificate' },
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Student Aadhaar Card' },
            ],
          },
          {
            id: 'c4444444-4444-4444-4444-444444444444',
            code: 'UP-POST-MATRIC-SCHOLARSHIP',
            title: 'Uttar Pradesh Post-Matric Scholarship & Fee Reimbursement',
            description: 'State government scholarship and complete tuition reimbursement for students residing in Uttar Pradesh pursuing post-matric studies.',
            category: 'EDUCATION' as const,
            department: 'Social Welfare Department, Government of Uttar Pradesh',
            state: 'Uttar Pradesh',
            isCentralScheme: false,
            financialBenefit: 50000.0,
            rules: [
              { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student enrolled in a recognized institution' },
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual family income must not exceed Rs 2,50,000' },
            ],
            documents: [
              { documentType: 'EDUCATIONAL_CERTIFICATE' as const, isMandatory: true, description: 'Post-Matric Marksheet or Admission Letter' },
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card for identity verification' },
            ],
          },
          {
            id: 'd4444444-4444-4444-4444-444444444444',
            code: 'AYUSHMAN-BHARAT-PMJAY',
            title: 'Ayushman Bharat PM-JAY Health Protection',
            description: 'Health insurance coverage of up to Rs 5,00,000 per family per year for secondary and tertiary healthcare hospitalizations.',
            category: 'HEALTHCARE' as const,
            department: 'National Health Authority',
            isCentralScheme: true,
            financialBenefit: 500000.0,
            rules: [
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '800000', isRequired: true, description: 'Annual income must be under Rs 8,00,000' },
              { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be an adult citizen' },
            ],
            documents: [
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card for e-KYC' },
              { documentType: 'CASTE_CERTIFICATE' as const, isMandatory: false, description: 'Caste Certificate if claiming reservation category' },
            ],
          },
          {
            id: 'e5555555-5555-5555-5555-555555555555',
            code: 'PM-MUDRA-YOJANA',
            title: 'Pradhan Mantri MUDRA Micro-Enterprise Loan Subsidy',
            description: 'Credit linkage and capital interest subsidy of up to Rs 50,000 for self-employed micro-enterprises and daily-wage entrepreneurs.',
            category: 'FINANCIAL_INCLUSION' as const,
            department: 'Department of Financial Services',
            isCentralScheme: true,
            financialBenefit: 50000.0,
            rules: [
              { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be at least 18 years old' },
            ],
            documents: [
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card of enterprise owner' },
              { documentType: 'DRIVING_LICENSE' as const, isMandatory: false, description: 'Driving Licence for commercial transport ventures' },
            ],
          },
          {
            id: 'f6666666-6666-6666-6666-666666666666',
            code: 'NSAP-NATIONAL-PENSION',
            title: 'National Social Assistance Old Age Pension',
            description: 'Monthly social security financial support of Rs 1,000 per month (Rs 12,000/yr) for senior citizens.',
            category: 'SOCIAL_SECURITY' as const,
            department: 'Ministry of Rural Development',
            isCentralScheme: true,
            financialBenefit: 12000.0,
            rules: [
              { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Senior citizen age must be 60 years or above' },
              { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual income must not exceed Rs 2,50,000' },
            ],
            documents: [
              { documentType: 'BIRTH_CERTIFICATE' as const, isMandatory: true, description: 'Birth Certificate or Age Proof document' },
              { documentType: 'AADHAAR' as const, isMandatory: true, description: 'Aadhaar Card for identity' },
            ],
          },
        ];

        for (const s of defaultSchemes) {
          const exists = await this.prisma.client.welfareScheme.findUnique({ where: { code: s.code } });
          if (!exists) {
            await this.prisma.client.welfareScheme.create({
              data: {
                id: s.id,
                code: s.code,
                title: s.title,
                description: s.description,
                category: s.category,
                department: s.department,
                isCentralScheme: true,
                financialBenefit: s.financialBenefit,
                isActive: true,
                eligibilityRules: {
                  create: s.rules.map((r) => ({
                    attributeKey: r.attributeKey,
                    operator: r.operator,
                    targetValue: r.targetValue,
                    isRequired: r.isRequired,
                    description: r.description,
                  })),
                },
                requiredDocuments: {
                  create: s.documents.map((d) => ({
                    documentType: d.documentType,
                    isMandatory: d.isMandatory,
                    description: d.description,
                  })),
                },
              },
            });
          }
        }
        this.logger.log('✅ Welfare schemes catalog initialized successfully.');
      }
    } catch (err: any) {
      this.logger.warn(`Welfare scheme catalog sync notice: ${err?.message}`);
    }
  }

  async getAllSchemes(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]> {
    return await this.schemeRepo.findAllActive(category, state);
  }

  async getSchemeById(id: string): Promise<WelfareSchemeEntity> {
    const scheme = await this.schemeRepo.findById(id);
    if (!scheme) {
      throw new NotFoundException(`Welfare scheme with ID '${id}' not found.`);
    }
    return scheme;
  }
}
