import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
