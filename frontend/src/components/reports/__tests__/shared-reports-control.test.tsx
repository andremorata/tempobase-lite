import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SharedReportsControl } from "../shared-reports-control";

describe("SharedReportsControl", () => {
  it("creates a named share from the inline create input", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <SharedReportsControl
        sharedReports={[]}
        latestShareUrl={null}
        onCreate={onCreate}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
        isCreating={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /shared reports/i }));
    expect(screen.getByText(/no shared reports yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /share current/i }));
    await user.type(screen.getByPlaceholderText(/shared report name/i), "Customer detail snapshot");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onCreate).toHaveBeenCalledWith("Customer detail snapshot");
    expect(screen.queryByPlaceholderText(/shared report name/i)).not.toBeInTheDocument();
  });

  it("renders existing shares and forwards copy and delete actions", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const onDelete = vi.fn();
    const share = {
      id: "share-1",
      name: "Q1 summary",
      token: "share-token-existing",
      reportType: "Summary",
      from: "2026-01-01",
      to: "2026-03-31",
      expiresAt: null,
      createdAt: "2026-03-23T12:00:00Z",
    };

    render(
      <SharedReportsControl
        sharedReports={[share]}
        latestShareUrl="http://localhost:3000/shared/share-token-existing"
        onCreate={vi.fn()}
        onCopy={onCopy}
        onDelete={onDelete}
        isCreating={false}
      />,
    );

    expect(screen.getByText(/share-token-existing/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /shared reports/i }));

    expect(screen.getByText("Q1 summary")).toBeInTheDocument();
    expect(screen.getByText(/summary report/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copy link/i }));
    expect(onCopy).toHaveBeenCalledWith(share);

    await user.click(screen.getByTitle(/delete shared report/i));
    expect(onDelete).toHaveBeenCalledWith(share);
  });
});