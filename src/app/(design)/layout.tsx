import type { Metadata } from "next";
import DesignNav from "@/components/ui/DesignNav";

export const metadata: Metadata = {
  title: "Design System",
  description: "UI Component Library & Design Tokens",
};

export default function DesignLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Fixed sidebar for design navigation */}
      <aside className="w-full md:w-64 md:fixed md:h-screen overflow-auto border-r border-neutral-200">
        <DesignNav />
      </aside>
      
      {/* Main content with left margin to account for sidebar */}
      <main className="flex-1 md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
} 