import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs" // Guessing they use bcryptjs or similar

const prisma = new PrismaClient()

async function main() {
    const email = "admin@complianceflow.com"
    const newPassword = "admin" // Default simple password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`Setting password for ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            role: 'ADMIN',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin'
        }
    });

    console.log(`Success! Password for ${user.email} set to: ${newPassword}`);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
