import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking ProgramCategory model:", !!prisma.programCategory);
        
        const count = await prisma.programCategory.count();
        console.log("Program categories count:", count);
        
        console.log("All good!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
