"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CandyButton } from "@/components/CandyButton";
import { FieldError, a11y } from "@/components/submit/Field";
import { loginSchema, type LoginInput } from "@/lib/schemas/login";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onValid = async (values: LoginInput) => {
    setFormError(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword(values);
    if (error) {
      // Same message for "no such user" and "wrong password", so it doesn't reveal which emails exist.
      setFormError("That email and password don’t match.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form className="submit-form login-form" noValidate onSubmit={handleSubmit(onValid)}>
      {formError && (
        <div className="form-banner" role="alert">
          {formError}
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input type="email" autoComplete="username" {...register("email")} {...a11y("email", { error: errors.email?.message })} />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input type="password" autoComplete="current-password" {...register("password")} {...a11y("password", { error: errors.password?.message })} />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>
      <CandyButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Opening the kitchen…" : "Sign in →"}
      </CandyButton>
    </form>
  );
}
