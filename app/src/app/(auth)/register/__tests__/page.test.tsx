import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "../page";

const mockPush = vi.fn();
const mockRegister = vi.fn();
const mockRegisterViaInvite = vi.fn();

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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inviteToken = "";
  });

  it("creates a workspace account and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

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
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("joins an existing workspace when an invite token is present", async () => {
    const user = userEvent.setup();
    inviteToken = "invite-token-123";
    mockRegisterViaInvite.mockResolvedValue(undefined);

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
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
