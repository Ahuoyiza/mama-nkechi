import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { signOut } from "@/app/admin/actions";
import { Brand } from "@/components/Brand";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Mama’s kitchen", robots: { index: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      {/* Reading the session cookie is request data, so the admin area renders per request. */}
      <Suspense fallback={<p className="admin-loading">Checking the kitchen door…</p>}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin(); // not an admin? -> /admin/login

  return (
    <>
      <header className="admin-header">
        <Brand />
        <nav aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/submissions">Submissions</Link>
          <Link href="/admin/recipes">Recipes</Link>
          <Link href="/">View site ↗</Link>
        </nav>
        <form action={signOut} className="admin-user">
          <span>{user.email}</span>
          <button type="submit" className="link-button">
            Sign out
          </button>
        </form>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
