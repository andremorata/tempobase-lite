import { describe, it, expect } from "vitest";
import type {
  ImportDateFormat,
  ImportPreviewRow,
  ImportParseResponse,
  ImportRowRequest,
  ImportExecuteRequest,
  ImportExecuteResponse,
  ImportRowError,
  ParseImportRequest,
} from "../../types";

// ─── Type shape tests ─────────────────────────────────────────────────────────

describe("ImportPreviewRow", () => {
  it("has required shape", () => {
    const row: ImportPreviewRow = {
      rowIndex: 0,
      rawClientName: "Acme Corp",
      rawProjectName: "Website Redesign",
      rawTaskName: "Development",
      description: "Code review",
      isBillable: true,
      startTime: "2026-03-01T09:00:00Z",
      endTime: "2026-03-01T11:30:00Z",
      durationDecimal: 2.5,
      suggestedProjectId: "proj-123",
      suggestedTaskId: null,
      errors: [],
    };

    expect(row.rowIndex).toBe(0);
    expect(row.isBillable).toBe(true);
    expect(row.durationDecimal).toBe(2.5);
    expect(row.errors).toHaveLength(0);
  });

  it("accepts null optional fields", () => {
    const row: ImportPreviewRow = {
      rowIndex: 1,
      rawClientName: null,
      rawProjectName: null,
      rawTaskName: null,
      description: null,
      isBillable: false,
      startTime: "2026-03-01T14:00:00Z",
      endTime: "2026-03-01T15:00:00Z",
      durationDecimal: 1.0,
      suggestedProjectId: null,
      suggestedTaskId: null,
      errors: ["Cannot parse start date/time"],
    };

    expect(row.rawProjectName).toBeNull();
    expect(row.errors).toHaveLength(1);
  });
});

describe("ImportParseResponse", () => {
  it("has required shape", () => {
    const response: ImportParseResponse = {
      rows: [],
      totalRows: 0,
      parseErrors: [],
    };

    expect(response.totalRows).toBe(0);
    expect(response.rows).toHaveLength(0);
    expect(response.parseErrors).toHaveLength(0);
  });

  it("contains rows with correct types", () => {
    const response: ImportParseResponse = {
      rows: [
        {
          rowIndex: 0,
          rawClientName: "Client A",
          rawProjectName: "Project X",
          rawTaskName: null,
          description: "Some work",
          isBillable: true,
          startTime: "2026-03-01T09:00:00Z",
          endTime: "2026-03-01T10:00:00Z",
          durationDecimal: 1.0,
          suggestedProjectId: null,
          suggestedTaskId: null,
          errors: [],
        },
      ],
      totalRows: 1,
      parseErrors: [],
    };

    expect(response.totalRows).toBe(1);
    expect(response.rows[0].durationDecimal).toBe(1.0);
  });
});

describe("ParseImportRequest", () => {
  it("captures the file and explicit date format", () => {
    const request: ParseImportRequest = {
      file: new File(["csv"], "import.csv", { type: "text/csv" }),
      dateFormat: "dmy",
    };

    expect(request.file.name).toBe("import.csv");
    expect(request.dateFormat).toBe("dmy");
  });
});

describe("ImportDateFormat", () => {
  it("supports the allowed import date formats", () => {
    const formats: ImportDateFormat[] = ["ymd", "dmy", "mdy"];

    expect(formats).toEqual(["ymd", "dmy", "mdy"]);
  });
});

describe("ImportRowRequest", () => {
  it("has required shape with include=true", () => {
    const row: ImportRowRequest = {
      rowIndex: 0,
      startTime: "2026-03-01T09:00:00Z",
      endTime: "2026-03-01T11:00:00Z",
      description: "Work done",
      isBillable: true,
      projectId: "proj-abc",
      taskId: null,
      include: true,
    };

    expect(row.include).toBe(true);
    expect(row.projectId).toBe("proj-abc");
  });

  it("can exclude a row", () => {
    const row: ImportRowRequest = {
      rowIndex: 2,
      startTime: "2026-03-02T09:00:00Z",
      endTime: "2026-03-02T10:00:00Z",
      description: null,
      isBillable: false,
      projectId: null,
      taskId: null,
      include: false,
    };

    expect(row.include).toBe(false);
    expect(row.description).toBeNull();
  });
});

describe("ImportExecuteRequest", () => {
  it("wraps rows correctly", () => {
    const request: ImportExecuteRequest = {
      rows: [
        {
          rowIndex: 0,
          startTime: "2026-03-01T09:00:00Z",
          endTime: "2026-03-01T10:00:00Z",
          description: "Row 1",
          isBillable: true,
          projectId: null,
          taskId: null,
          include: true,
        },
        {
          rowIndex: 1,
          startTime: "2026-03-02T09:00:00Z",
          endTime: "2026-03-02T10:00:00Z",
          description: "Row 2",
          isBillable: false,
          projectId: null,
          taskId: null,
          include: false,
        },
      ],
    };

    expect(request.rows).toHaveLength(2);
    expect(request.rows[0].include).toBe(true);
    expect(request.rows[1].include).toBe(false);
  });
});

describe("ImportExecuteResponse", () => {
  it("has correct shape on success", () => {
    const response: ImportExecuteResponse = {
      importedCount: 5,
      skippedCount: 1,
      errors: [],
    };

    expect(response.importedCount).toBe(5);
    expect(response.skippedCount).toBe(1);
    expect(response.errors).toHaveLength(0);
  });

  it("includes row errors when some rows fail", () => {
    const err: ImportRowError = { rowIndex: 3, message: "End time before start time." };
    const response: ImportExecuteResponse = {
      importedCount: 4,
      skippedCount: 0,
      errors: [err],
    };

    expect(response.errors[0].rowIndex).toBe(3);
    expect(response.errors[0].message).toContain("start time");
  });
});

// ─── Duration formatting helper ────────────────────────────────────────────────

function fmtDuration(decimal: number): string {
  const hrs = Math.floor(decimal);
  const mins = Math.round((decimal - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

describe("fmtDuration", () => {
  it("formats whole hours", () => {
    expect(fmtDuration(2)).toBe("2h");
  });

  it("formats minutes only", () => {
    expect(fmtDuration(0.5)).toBe("30m");
  });

  it("formats hours and minutes", () => {
    expect(fmtDuration(2.5)).toBe("2h 30m");
  });

  it("formats 0 as 0m", () => {
    expect(fmtDuration(0)).toBe("0m");
  });
});
