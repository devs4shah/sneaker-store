"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFormCard } from "@/components/forms/AuthFormCard";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/apiClient";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const auth = await authService.login(values);
      setAuth({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        tokenType: auth.tokenType,
      });

      const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Login failed"));
    }
  };

  return (
    <AuthFormCard
      title="Welcome back"
      subtitle="Sign in to continue shopping"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Alert variant="error" message={serverError ?? ""} />

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <SubmitButton label="Sign in" isLoading={isSubmitting} />
      </form>
    </AuthFormCard>
  );
}
