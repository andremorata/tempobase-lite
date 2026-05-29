-- CreateTable
CREATE TABLE "user_project_access" (
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "user_project_access_pkey" PRIMARY KEY ("user_id","project_id")
);

-- CreateTable
CREATE TABLE "user_task_access" (
    "user_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "user_task_access_pkey" PRIMARY KEY ("user_id","task_id")
);

-- CreateIndex
CREATE INDEX "user_project_access_account_id_idx" ON "user_project_access"("account_id");

-- CreateIndex
CREATE INDEX "user_project_access_user_id_idx" ON "user_project_access"("user_id");

-- CreateIndex
CREATE INDEX "user_task_access_account_id_idx" ON "user_task_access"("account_id");

-- CreateIndex
CREATE INDEX "user_task_access_user_id_idx" ON "user_task_access"("user_id");

-- AddForeignKey
ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_task_access" ADD CONSTRAINT "user_task_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "domain_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_task_access" ADD CONSTRAINT "user_task_access_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_task_access" ADD CONSTRAINT "user_task_access_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
