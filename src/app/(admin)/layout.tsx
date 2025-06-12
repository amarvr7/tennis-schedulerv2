import type { Metadata } from "next";
import AdminSidebar from "@/components/ui/AdminSidebar";

export const metadata: Metadata = {
  title: "Next.js 15+ Admin",
  description: "Admin section with sidebar navigation",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
} 