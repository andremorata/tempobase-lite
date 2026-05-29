import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import LoginPage from "../page";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockLogin = vi.fn();

let authUser: { id: string; email: string } | null = null;
let authIsLoading = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ login: mockLogin, user: authUser, isLoading: authIsLoading }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authUser = null;
    authIsLoading = false;
  });

  it("signs in and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "owner@example.com",
        password: "Password123",
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects to dashboard when user is already authenticated", async () => {
    authUser = { id: "user-1", email: "owner@example.com" };
    authIsLoading = false;

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows a friendly error for invalid credentials", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new ApiError(401, "Unauthorized"));

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
