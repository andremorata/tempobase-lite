import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "../page";

const mockPush = vi.fn();
const mockRegister = vi.fn();
const mockRegisterViaInvite = vi.fn();
const mockApiFetch = vi.fn();

let inviteToken = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === "invite" ? inviteToken : null),
  }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    register: mockRegister,
    registerViaInvite: mockRegisterViaInvite,
  }),
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...original,
    apiFetch: (...args: unknown[]) => mockApiFetch(...args),
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inviteToken = "";
    mockApiFetch.mockResolvedValue({ defaultLandingPage: "tracker" });
  });

  it("creates a workspace account and redirects to the user's default landing page", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);
    mockApiFetch.mockResolvedValue({ defaultLandingPage: "tracker" });

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), "Avery");
    await user.type(screen.getByLabelText(/last name/i), "Owner");
    await user.type(screen.getByLabelText(/work email/i), "avery@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123");
    await user.type(screen.getByLabelText(/workspace name/i), "TempoBase");
    await user.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: "Avery",
        lastName: "Owner",
        email: "avery@example.com",
        password: "Password123",
        accountName: "TempoBase",
      });
    });
    expect(mockRegisterViaInvite).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("/users/me");
    });
    expect(mockPush).toHaveBeenCalledWith("/tracker");
  });

  it("joins an existing workspace and redirects to the user's default landing page", async () => {
    const user = userEvent.setup();
    inviteToken = "invite-token-123";
    mockRegisterViaInvite.mockResolvedValue(undefined);
    mockApiFetch.mockResolvedValue({ defaultLandingPage: "timesheet" });

    render(<RegisterPage />);

    expect(screen.queryByLabelText(/workspace name/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/first name/i), "Morgan");
    await user.type(screen.getByLabelText(/last name/i), "Member");
    await user.type(screen.getByLabelText(/work email/i), "morgan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123");
    await user.click(screen.getByRole("button", { name: /join workspace/i }));

    await waitFor(() => {
      expect(mockRegisterViaInvite).toHaveBeenCalledWith({
        inviteToken: "invite-token-123",
        firstName: "Morgan",
        lastName: "Member",
        email: "morgan@example.com",
        password: "Password123",
      });
    });
    expect(mockRegister).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("/users/me");
    });
    expect(mockPush).toHaveBeenCalledWith("/timesheet");
  });
});
