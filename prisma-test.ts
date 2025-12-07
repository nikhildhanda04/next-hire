
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Client...');

    // We don't need a real ID, we just want to see if the query constructs successfully without validation error.
    // We can use a dummy ID. If it returns null, that's fine. If it throws ValidationError, that's the issue.
    try {
        const user = await prisma.user.findUnique({
            where: { id: 'dummy_id' },
            select: {
                preferredName: true, // This is the field causing issues
                name: true
            }
        });
        console.log('Query constructed successfully. Result:', user);
    } catch (e) {
        console.error('Error during query:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
