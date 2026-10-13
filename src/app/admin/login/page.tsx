import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-petrol-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/r7-lockup-champagne.png"
            alt="R7 Investimentos Imobiliários"
            className="mx-auto h-28 w-auto"
          />
          <h1 className="mt-4 font-display text-xl text-white">
            Área administrativa
          </h1>
          <p className="mt-1 text-sm text-petrol-200">
            Acesso restrito à equipe R7
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
