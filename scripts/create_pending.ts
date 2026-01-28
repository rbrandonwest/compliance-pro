import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Creating pending filing...")

    // 1. Get User
    const user = await prisma.user.findUnique({
        where: { email: 'demo@complianceflow.com' }
    });

    if (!user) {
        throw new Error("Demo user not found. Did you run seed?");
    }

    // 2. Get Business Doc
    const docId = 'P15000085255';
    const doc = await prisma.businessDocument.findUnique({
        where: { documentNumber: docId }
    });

    if (!doc) {
        throw new Error("Business Doc not found. Did you run seed?");
    }

    // 3. Ensure FiledEntity Exists
    const entity = await prisma.filedEntity.upsert({
        where: {
            userId_documentNumber: {
                userId: user.id,
                documentNumber: docId
            }
        },
        update: {},
        create: {
            userId: user.id,
            documentNumber: docId,
            businessName: doc.companyName,
            inCompliance: false
        }
    });

    // 4. Create Pending Filing
    const filing = await prisma.filing.create({
        data: {
            businessId: entity.id,
            userId: user.id,
            year: 2024,
            status: "PENDING",
            invoiceNumber: "INV-TEST-001"
        }
    });

    console.log(`Created PENDING filing (ID: ${filing.id}) for ${doc.companyName}`);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
