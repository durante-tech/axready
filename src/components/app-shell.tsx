"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/app/_navigation/header";
import { Sidebar } from "@/app/_navigation/sidebar/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAxRoute = pathname.startsWith("/ax");

  if (isAxRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden border-collapse">
        <Sidebar />
        <main
          className="
            min-h-screen flex-1
            overflow-y-auto overflow-x-hidden
            py-24 px-8
            bg-secondary/20
            flex flex-col
          "
        >
          {children}
        </main>
      </div>
    </>
  );
}
