"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const pmKisan = await prisma.welfareScheme.upsert({
        where: { code: 'PM-KISAN' },
        update: {},
        create: {
            id: 'a1111111-1111-1111-1111-111111111111',
            code: 'PM-KISAN',
            title: 'Pradhan Mantri Kisan Samman Nidhi',
            description: 'Financial assistance of Rs 6,000 per year to small and marginal farmers.',
            category: 'AGRICULTURE',
            department: 'Ministry of Agriculture and Farmers Welfare',
            isCentralScheme: true,
            financialBenefit: 6000.0,
            isActive: true,
            eligibilityRules: {
                create: [
                    {
                        attributeKey: 'employmentStatus',
                        operator: 'EQUALS',
                        targetValue: 'FARMER',
                        isRequired: true,
                        description: 'Must be an active farmer',
                    },
                    {
                        attributeKey: 'annualIncomeINR',
                        operator: 'LESS_THAN',
                        targetValue: '300000',
                        isRequired: true,
                        description: 'Annual income must be less than Rs 3,00,000',
                    },
                ],
            },
            requiredDocuments: {
                create: [
                    {
                        documentType: 'AADHAAR',
                        isMandatory: true,
                        description: 'Aadhaar Card for identity verification',
                    },
                    {
                        documentType: 'LAND_RECORD',
                        isMandatory: true,
                        description: 'Land Ownership Record',
                    },
                ],
            },
        },
    });
    console.log('✅ Database seeded successfully. Scheme:', pmKisan.title);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map