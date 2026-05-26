"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFormCard } from "@/components/forms/AuthFormCard";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/apiClient";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const auth = await authService.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      setAuth({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        tokenType: auth.tokenType,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Registration failed"));
    }
  };

  return (
    <AuthFormCard
      title="Create account"
      subtitle="Join ProSneaker and start shopping"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Alert variant="error" message={serverError ?? ""} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <FormField
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

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
          autoComplete="new-password"
          placeholder="Min. 8 chars, upper, lower, number"
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <SubmitButton label="Create account" isLoading={isSubmitting} />
      </form>
    </AuthFormCard>
  );
}
