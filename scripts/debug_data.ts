import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking BusinessDocument count...")
    const count = await prisma.businessDocument.count()
    console.log(`Total records: ${count}`)

    if (count > 0) {
        console.log("Sample records:")
        const samples = await prisma.businessDocument.findMany({
            take: 5,
            select: {
                companyName: true,
                active: true,
                active: true // checking if this exists implicitly or if I was hallucinating
            }
        })
        console.log(JSON.stringify(samples, null, 2))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
