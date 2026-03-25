/**
 * Time Entry Response Mappers
 *
 * Maps Prisma TimeEntry records to the frontend TimeEntry interface contract
 */

import { TimeEntry as PrismaTimeEntry, TimeEntryTag, Tag } from "@prisma/client";

type PrismaTimeEntryWithTags = PrismaTimeEntry & {
  tags: (TimeEntryTag & { tag: Tag })[];
};

/**
 * Maps a Prisma TimeEntry with tags to the frontend TimeEntry interface
 * Frontend expects tagIds as an array of strings, not nested objects
 */
export function mapTimeEntry(entry: PrismaTimeEntryWithTags) {
  return {
    id: entry.id,
    accountId: entry.accountId,
    userId: entry.userId,
    projectId: entry.projectId,
    taskId: entry.taskId,
    description: entry.description,
    entryDate: entry.entryDate.toISOString().split("T")[0],
    startTime: entry.startTime,
    endTime: entry.endTime,
    duration: entry.duration,
    durationDecimal: entry.durationDecimal,
    isBillable: entry.isBillable,
    isRunning: entry.isRunning,
    tagIds: entry.tags.map((tt) => tt.tagId),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}
