import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // 1. Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@complianceflow.com' },
        update: { role: 'ADMIN' },
        create: {
            email: 'admin@complianceflow.com',
            role: 'ADMIN',
            firstName: "System",
            lastName: "Admin"
        },
    });

    // 2. Client User
    const user = await prisma.user.upsert({
        where: { email: 'demo@complianceflow.com' },
        update: { role: 'CLIENT' },
        create: {
            email: 'demo@complianceflow.com',
            role: 'CLIENT',
            stripeCustomerId: 'cus_test123',
            firstName: "Demo",
            lastName: "Account"
        },
    });

    const docId = 'P15000085255';

    // 2. Business Document
    const busDoc = await prisma.businessDocument.upsert({
        where: { documentNumber: docId },
        update: {},
        create: {
            documentNumber: docId,
            companyName: 'VAN STEPHEN SALIBA, P.A.',
            companyType: 'Florida Profit Corporation',
            active: true, // Replaced 'status'
            state: 'FL',
            dateFiled: new Date('2015-01-01'), // Approximate
            ein: '00-0000000',
            principalAddress: '123 Main St, Miami, FL 33101',
            registeredAgentName: 'VAN STEPHEN SALIBA'
        },
    });

    // 3. Filed Entity
    const filedEntity = await prisma.filedEntity.upsert({
        where: { userId_documentNumber: { userId: user.id, documentNumber: docId } },
        update: {},
        create: {
            userId: user.id,
            documentNumber: docId,
            businessName: busDoc.companyName,
            // businessDoc relation is handled by documentNumber FK
            lastFiled: new Date('2024-01-01'),
            inCompliance: false
        },
    });

    // 4. System Settings
    await prisma.systemSetting.upsert({
        where: { key: 'automation_enabled' },
        update: {},
        create: {
            key: 'automation_enabled',
            value: 'false', // Default to OFF
            description: 'Master switch for background filing automation.'
        }
    });

    console.log({ user, filedEntity, setting: 'automation_enabled=false' });
    console.log('Seeded database successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
