import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB Connected via Prisma");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Database connection error: ${errorMessage}`);
    process.exit(1); // Terminates the Node.js process with an exit code of 1. Exit code 1 is conventionally used to indicate an error.
  }
};

const disConnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disConnectDB };
