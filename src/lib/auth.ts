import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

export interface SessionInfo {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
}

/**
 * Retorna sessão + perfil. Não faz redirect — usar em páginas públicas
 * ou onde o tratamento de ausência de sessão é customizado.
 */
export async function getSession(): Promise<SessionInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email, profile };
}

export async function requireStaff(next?: string): Promise<SessionInfo> {
  const session = await getSession();
  if (!session || !session.profile) {
    redirect(
      `/admin/login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!["admin", "editor"].includes(session.profile.role)) {
    redirect("/admin/login?error=forbidden");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await requireStaff();
  if (session.profile!.role !== "admin") {
    redirect("/admin?error=forbidden");
  }
  return session;
}
