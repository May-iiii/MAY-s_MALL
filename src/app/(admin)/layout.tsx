import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: { default: "后台管理", template: "%s | MAY's Mall 后台" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar email={user.email} />
        <main className="flex-1 bg-surface-secondary p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
