/**
 * Prisma Seed Script
 *
 * Creates a demo account with sample data for development/testing.
 * Idempotent — safe to run multiple times.
 * Run: npx prisma db seed
 */

import { PrismaClient, UserRole, ProjectStatus, BillingType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or DIRECT_DATABASE_URL environment variable is required for seeding"
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";
const OWNER_USER_ID = "00000000-0000-0000-0000-000000000010";
const MEMBER_USER_ID = "00000000-0000-0000-0000-000000000011";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Upsert account ──────────────────────────────────────────────────────
  const account = await prisma.account.upsert({
    where: { id: DEMO_ACCOUNT_ID },
    update: { name: "Demo Company" },
    create: {
      id: DEMO_ACCOUNT_ID,
      name: "Demo Company",
      slug: "demo-company",
      timezone: "America/New_York",
      currency: "USD",
      auditRetentionDays: 365,
    },
  });

  console.log("✅ Account:", account.name);

  // ─── Upsert owner user ───────────────────────────────────────────────────
  const ownerPasswordHash = await bcrypt.hash("Demo1234!", 10);
  const owner = await prisma.user.upsert({
    where: { id: OWNER_USER_ID },
    update: { passwordHash: ownerPasswordHash, isActive: true, isDeleted: false },
    create: {
      id: OWNER_USER_ID,
      accountId: account.id,
      email: "owner@demo.local",
      firstName: "Alice",
      lastName: "Owner",
      passwordHash: ownerPasswordHash,
      role: UserRole.Owner,
      isActive: true,
      dateFormat: "mdy",
    },
  });

  console.log("✅ Owner user:", owner.email);

  // ─── Upsert member user ──────────────────────────────────────────────────
  const memberPasswordHash = await bcrypt.hash("Demo1234!", 10);
  const member = await prisma.user.upsert({
    where: { id: MEMBER_USER_ID },
    update: { passwordHash: memberPasswordHash, isActive: true, isDeleted: false },
    create: {
      id: MEMBER_USER_ID,
      accountId: account.id,
      email: "member@demo.local",
      firstName: "Bob",
      lastName: "Member",
      passwordHash: memberPasswordHash,
      role: UserRole.Member,
      isActive: true,
      dateFormat: "mdy",
    },
  });

  console.log("✅ Member user:", member.email);

  // ─── Clean downstream demo data (FK-safe order) ──────────────────────────
  await prisma.timeEntryTag.deleteMany({
    where: { timeEntry: { accountId: account.id } },
  });
  await prisma.timeEntry.deleteMany({ where: { accountId: account.id } });
  await prisma.tag.deleteMany({ where: { accountId: account.id } });
  await prisma.projectTask.deleteMany({ where: { accountId: account.id } });
  await prisma.project.deleteMany({ where: { accountId: account.id } });
  await prisma.client.deleteMany({ where: { accountId: account.id } });

  // ─── Create clients ──────────────────────────────────────────────────────
  const clientA = await prisma.client.create({
    data: {
      accountId: account.id,
      name: "Acme Corp",
      email: "contact@acme.example",
      phone: "+1-555-0100",
      notes: "Primary client",
      isArchived: false,
    },
  });

  const clientB = await prisma.client.create({
    data: {
      accountId: account.id,
      name: "TechStart Inc",
      email: "hello@techstart.example",
      phone: "+1-555-0200",
      notes: "Startup client",
      isArchived: false,
    },
  });

  console.log("✅ Created 2 clients");

  // ─── Create projects ─────────────────────────────────────────────────────
  const projectWebsite = await prisma.project.create({
    data: {
      accountId: account.id,
      clientId: clientA.id,
      name: "Website Redesign",
      color: "#3b82f6",
      status: ProjectStatus.Active,
      billingType: BillingType.Hourly,
      hourlyRate: 150.0,
      budgetHours: 80.0,
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      accountId: account.id,
      clientId: clientB.id,
      name: "Mobile App Development",
      color: "#10b981",
      status: ProjectStatus.Active,
      billingType: BillingType.Fixed,
      budgetHours: 200.0,
    },
  });

  const projectInternal = await prisma.project.create({
    data: {
      accountId: account.id,
      clientId: null,
      name: "Internal Tools",
      color: "#8b5cf6",
      status: ProjectStatus.Active,
      billingType: BillingType.NonBillable,
    },
  });

  console.log("✅ Created 3 projects");

  // ─── Create tasks ────────────────────────────────────────────────────────
  const taskDesign = await prisma.projectTask.create({
    data: {
      accountId: account.id,
      projectId: projectWebsite.id,
      name: "UI Design",
      hourlyRate: 120.0,
      isActive: true,
    },
  });

  const taskDevelopment = await prisma.projectTask.create({
    data: {
      accountId: account.id,
      projectId: projectWebsite.id,
      name: "Frontend Development",
      hourlyRate: 150.0,
      isActive: true,
    },
  });

  const taskTesting = await prisma.projectTask.create({
    data: {
      accountId: account.id,
      projectId: projectWebsite.id,
      name: "QA Testing",
      hourlyRate: 100.0,
      isActive: true,
    },
  });

  const taskMobileDev = await prisma.projectTask.create({
    data: {
      accountId: account.id,
      projectId: projectMobile.id,
      name: "iOS Development",
      isActive: true,
    },
  });

  console.log("✅ Created 4 tasks");

  // ─── Create tags ─────────────────────────────────────────────────────────
  const tagBugfix = await prisma.tag.create({
    data: {
      accountId: account.id,
      name: "Bugfix",
      color: "#ef4444",
    },
  });

  const tagFeature = await prisma.tag.create({
    data: {
      accountId: account.id,
      name: "Feature",
      color: "#3b82f6",
    },
  });

  const tagMeeting = await prisma.tag.create({
    data: {
      accountId: account.id,
      name: "Meeting",
      color: "#f59e0b",
    },
  });

  console.log("✅ Created 3 tags");

  // ─── Create time entries ─────────────────────────────────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const entry1 = await prisma.timeEntry.create({
    data: {
      accountId: account.id,
      userId: owner.id,
      projectId: projectWebsite.id,
      taskId: taskDesign.id,
      description: "Created wireframes for homepage",
      entryDate: yesterday,
      startTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000), // 12 PM
      duration: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
      durationDecimal: 3.0,
      isBillable: true,
      isRunning: false,
    },
  });

  const entry2 = await prisma.timeEntry.create({
    data: {
      accountId: account.id,
      userId: member.id,
      projectId: projectWebsite.id,
      taskId: taskDevelopment.id,
      description: "Implemented responsive navigation",
      entryDate: yesterday,
      startTime: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000), // 1 PM
      endTime: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      duration: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
      durationDecimal: 4.0,
      isBillable: true,
      isRunning: false,
    },
  });

  const entry3 = await prisma.timeEntry.create({
    data: {
      accountId: account.id,
      userId: owner.id,
      projectId: projectMobile.id,
      taskId: taskMobileDev.id,
      description: "Setup project structure",
      entryDate: today,
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(today.getTime() + 12.5 * 60 * 60 * 1000), // 12:30 PM
      duration: 2.5 * 60 * 60 * 1000, // 2.5 hours in milliseconds
      durationDecimal: 2.5,
      isBillable: true,
      isRunning: false,
    },
  });

  console.log("✅ Created 3 time entries");

  // ─── Associate tags with time entries ─────────────────────────────────────
  await prisma.timeEntryTag.create({
    data: { timeEntryId: entry1.id, tagId: tagFeature.id },
  });

  await prisma.timeEntryTag.create({
    data: { timeEntryId: entry2.id, tagId: tagFeature.id },
  });

  await prisma.timeEntryTag.create({
    data: { timeEntryId: entry3.id, tagId: tagFeature.id },
  });

  console.log("✅ Associated tags with time entries");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Demo credentials:");
  console.log("   Owner: owner@demo.local / Demo1234!");
  console.log("   Member: member@demo.local / Demo1234!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
