"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/client";
import { AlertTriangle } from "lucide-react";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountName?: string;
};

function RegisterPageContent() {
  const { register: registerUser, registerViaInvite } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite")?.trim() ?? "";
  const isInviteFlow = inviteToken.length > 0;
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = useMemo(
    () => z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Enter a valid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[0-9]/, "Password must contain a number"),
      accountName: z.string().optional(),
    }).superRefine((value, ctx) => {
      if (!isInviteFlow && (!value.accountName || value.accountName.trim().length < 2)) {
        ctx.addIssue({
          code: "custom",
          path: ["accountName"],
          message: "Workspace name must be at least 2 characters",
        });
      }
    }),
    [isInviteFlow],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      if (isInviteFlow) {
        await registerViaInvite({
          inviteToken,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        });
      } else {
        await registerUser({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          accountName: values.accountName ?? "",
        });
      }
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError(isInviteFlow
          ? "This invite is invalid or the email is already in use for this workspace."
          : "An account with this email already exists.");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">
          {isInviteFlow ? "Join your workspace" : "Create your workspace"}
        </CardTitle>
        <CardDescription>
          {isInviteFlow
            ? "Complete your account to join an existing TempoBase workspace."
            : "Start tracking time with a free TempoBase account."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 py-4">
          {/* Development warning */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-300/30 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[12px] leading-relaxed text-amber-800 dark:text-amber-200/80">
              TempoBase is in <span className="font-semibold">active development</span>.
              Your data may be reset at any time without notice. Export or back up
              anything you want to keep.
            </p>
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Jane"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Smith"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {!isInviteFlow && (
            <div className="space-y-2">
              <Label htmlFor="accountName">Workspace name</Label>
              <Input
                id="accountName"
                placeholder="Acme Inc."
                {...register("accountName")}
              />
              {errors.accountName && (
                <p className="text-xs text-destructive">
                  {errors.accountName.message}
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (isInviteFlow ? "Joining workspace…" : "Creating workspace…") : (isInviteFlow ? "Join workspace" : "Create workspace")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading registration…</CardContent></Card>}>
      <RegisterPageContent />
    </Suspense>
  );
}
