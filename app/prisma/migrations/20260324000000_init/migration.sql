-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Owner', 'Admin', 'Manager', 'Member', 'Viewer');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Active', 'Archived');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('Hourly', 'Fixed', 'NonBillable');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "audit_retention_days" INTEGER NOT NULL DEFAULT 365,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_users" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(500) NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" VARCHAR(1000),
    "date_format" VARCHAR(20) NOT NULL DEFAULT 'system',
    "default_project_id" UUID,
    "show_audit_metadata" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "domain_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_invites" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "account_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(50),
    "notes" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "client_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    "status" "ProjectStatus" NOT NULL DEFAULT 'Active',
    "billing_type" "BillingType" NOT NULL DEFAULT 'Hourly',
    "hourly_rate" DECIMAL(18,4),
    "budget_hours" DECIMAL(18,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "hourly_rate" DECIMAL(18,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "task_id" UUID,
    "description" VARCHAR(1000),
    "entry_date" DATE NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ,
    "duration" INTEGER,
    "duration_decimal" DECIMAL(18,4),
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "is_running" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entry_tags" (
    "time_entry_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "time_entry_tags_pkey" PRIMARY KEY ("time_entry_id","tag_id")
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "filters_json" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_reports" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "filters_json" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "shared_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_email" VARCHAR(320) NOT NULL DEFAULT '',
    "actor_name" VARCHAR(200) NOT NULL DEFAULT '',
    "actor_role" VARCHAR(20) NOT NULL DEFAULT '',
    "action" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "changes_json" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_slug_key" ON "accounts"("slug");

-- CreateIndex
CREATE INDEX "domain_users_account_id_idx" ON "domain_users"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_users_account_id_id_key" ON "domain_users"("account_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "account_invites_token_key" ON "account_invites"("token");

-- CreateIndex
CREATE INDEX "account_invites_account_id_idx" ON "account_invites"("account_id");

-- CreateIndex
CREATE INDEX "account_invites_token_idx" ON "account_invites"("token");

-- CreateIndex
CREATE INDEX "clients_account_id_idx" ON "clients"("account_id");

-- CreateIndex
CREATE INDEX "projects_account_id_idx" ON "projects"("account_id");

-- CreateIndex
CREATE INDEX "projects_client_id_idx" ON "projects"("client_id");

-- CreateIndex
CREATE INDEX "project_tasks_account_id_idx" ON "project_tasks"("account_id");

-- CreateIndex
CREATE INDEX "project_tasks_project_id_idx" ON "project_tasks"("project_id");

-- CreateIndex
CREATE INDEX "time_entries_account_id_user_id_entry_date_idx" ON "time_entries"("account_id", "user_id", "entry_date");

-- CreateIndex
CREATE INDEX "time_entries_account_id_is_running_idx" ON "time_entries"("account_id", "is_running");

-- CreateIndex
CREATE INDEX "tags_account_id_idx" ON "tags"("account_id");

-- CreateIndex
CREATE INDEX "saved_reports_account_id_idx" ON "saved_reports"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_reports_token_key" ON "shared_reports"("token");

-- CreateIndex
CREATE INDEX "shared_reports_account_id_idx" ON "shared_reports"("account_id");

-- CreateIndex
CREATE INDEX "shared_reports_token_idx" ON "shared_reports"("token");

-- CreateIndex
CREATE INDEX "audit_logs_account_id_idx" ON "audit_logs"("account_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "domain_users" ADD CONSTRAINT "domain_users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invites" ADD CONSTRAINT "account_invites_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry_tags" ADD CONSTRAINT "time_entry_tags_time_entry_id_fkey" FOREIGN KEY ("time_entry_id") REFERENCES "time_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry_tags" ADD CONSTRAINT "time_entry_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "domain_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
