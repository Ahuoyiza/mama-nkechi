import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { LoginForm } from "@/components/admin/LoginForm";
import { SteamingPot } from "@/components/doodles";

export const metadata: Metadata = { title: "Sign in | Mama’s kitchen", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <Brand />
      <div className="form-panel admin-login-card">
        <h1>
          <SteamingPot /> Mama’s kitchen
        </h1>
        <p className="field-hint">Staff only. Sign in to review recipes from the yard.</p>
        <LoginForm />
      </div>
    </main>
  );
}
