const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Perform a raw SQL query to test the connection
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log("Connection successful:", result);
    } catch (error) {
        console.error("Error connecting to the database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
