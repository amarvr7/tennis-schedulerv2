import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import MainContent from "@/components/ui/MainContent";

export const metadata: Metadata = {
  title: "Next.js 15+ Site",
  description: "Public site section with top navigation",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <MainContent>{children}</MainContent>
    </>
  );
} 