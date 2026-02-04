require("dotenv/config");

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const isSqlite = databaseUrl.startsWith("file:");

if (!isSqlite) {
  throw new Error("DATABASE_URL must use SQLite file: scheme.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

const prisma = new PrismaClient({ adapter });

async function exportPostgresData() {
  return {
    users: await prisma.user.findMany(),
    families: await prisma.family.findMany(),
    books: await prisma.book.findMany(),
    borrowings: await prisma.borrowing.findMany(),
    familyInvites: await prisma.familyInvite.findMany(),
    adminAudits: await prisma.adminAudit.findMany(),
  };
}

async function importToSQLite(data) {
  for (const family of data.families) {
    await prisma.family.create({
      data: {
        ...family,
        createdAt: new Date(family.createdAt),
        updatedAt: new Date(family.updatedAt),
      },
    });
  }

  for (const user of data.users) {
    await prisma.user.create({
      data: {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  for (const book of data.books) {
    await prisma.book.create({
      data: {
        ...book,
        createdAt: new Date(book.createdAt),
        updatedAt: new Date(book.updatedAt),
      },
    });
  }

  for (const borrowing of data.borrowings) {
    await prisma.borrowing.create({
      data: {
        ...borrowing,
        createdAt: new Date(borrowing.createdAt),
        dueDate: new Date(borrowing.dueDate),
        returnedAt: borrowing.returnedAt ? new Date(borrowing.returnedAt) : null,
      },
    });
  }

  for (const invite of data.familyInvites) {
    await prisma.familyInvite.create({
      data: {
        ...invite,
        createdAt: new Date(invite.createdAt),
      },
    });
  }

  for (const audit of data.adminAudits) {
    await prisma.adminAudit.create({
      data: {
        ...audit,
        createdAt: new Date(audit.createdAt),
      },
    });
  }
}

async function main() {
  const action = process.argv[2];

  if (action === "export") {
    const data = await exportPostgresData();
    process.stdout.write(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "import") {
    const inputPath = process.argv[3];
    if (!inputPath) {
      throw new Error("Missing import file path.");
    }
    const absolutePath = path.resolve(process.cwd(), inputPath);
    const input = fs.readFileSync(absolutePath, "utf-8");
    const data = JSON.parse(input);
    await importToSQLite(data);
    return;
  }

  throw new Error("Usage: node scripts/migrate-db.js export|import <file>");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
