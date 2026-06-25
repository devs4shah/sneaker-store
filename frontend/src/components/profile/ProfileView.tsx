"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/auth";

export function ProfileView() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      profileForm.reset({ firstName: data.firstName, lastName: data.lastName });
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load profile"));
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileForm]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setProfileMessage(null);
    setProfileError(null);
    try {
      const updated = await userService.updateProfile(values);
      setProfile(updated);
      updateUser(updated);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(getApiErrorMessage(err, "Failed to update profile"));
    }
  };

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Failed to change password"));
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (loadError || !profile) {
    return <ErrorState message={loadError ?? "Profile unavailable"} onRetry={loadProfile} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">Your profile</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Manage your personal details and password.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Back to dashboard
          </Link>
          <Link
            href="/dashboard/addresses"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Manage addresses
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile details</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Signed in as <span className="font-medium text-gray-800 dark:text-zinc-200">{profile.email}</span>
        </p>

        <form
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          <Alert variant="success" message={profileMessage ?? ""} />
          <Alert variant="error" message={profileError ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              autoComplete="given-name"
              error={profileForm.formState.errors.firstName?.message}
              {...profileForm.register("firstName")}
            />
            <FormField
              label="Last name"
              autoComplete="family-name"
              error={profileForm.formState.errors.lastName?.message}
              {...profileForm.register("lastName")}
            />
          </div>

          <SubmitButton
            label="Save profile"
            isLoading={profileForm.formState.isSubmitting}
          />
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Change password</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          <Alert variant="success" message={passwordMessage ?? ""} />
          <Alert variant="error" message={passwordError ?? ""} />

          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />

          <SubmitButton
            label="Update password"
            isLoading={passwordForm.formState.isSubmitting}
          />
        </form>
      </section>
    </div>
  );
}
