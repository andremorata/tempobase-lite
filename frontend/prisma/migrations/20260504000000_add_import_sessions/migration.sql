-- CreateTable
CREATE TABLE "import_sessions" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_name" VARCHAR(300),
    "file_hash" VARCHAR(64) NOT NULL,
    "date_format" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "row_count" INTEGER NOT NULL,
    "imported_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "parse_errors_json" TEXT NOT NULL DEFAULT '[]',
    "preview_rows_json" TEXT NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "failed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "import_sessions_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "time_entries" ADD COLUMN "import_session_id" UUID;

-- CreateIndex
CREATE INDEX "import_sessions_account_id_user_id_file_hash_date_format_idx" ON "import_sessions"("account_id", "user_id", "file_hash", "date_format");

-- CreateIndex
CREATE INDEX "import_sessions_account_id_status_idx" ON "import_sessions"("account_id", "status");

-- CreateIndex
CREATE INDEX "time_entries_import_session_id_idx" ON "time_entries"("import_session_id");

-- AddForeignKey
ALTER TABLE "import_sessions" ADD CONSTRAINT "import_sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_sessions" ADD CONSTRAINT "import_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_import_session_id_fkey" FOREIGN KEY ("import_session_id") REFERENCES "import_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
