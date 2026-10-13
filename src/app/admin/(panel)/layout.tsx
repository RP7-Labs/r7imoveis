import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/auth";

// Rotas do admin exigem sessão — sempre dinâmicas, nunca pré-renderizadas.
export const instant = false;

export const metadata = {
  title: { default: "Administração", template: "%s | Admin R7" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  return (
    <AdminShell
      userName={session.profile?.full_name ?? session.email ?? "Equipe"}
      userRole={session.profile?.role ?? "editor"}
    >
      {children}
    </AdminShell>
  );
}
