"use client";

import Sidebar from "@/app/component/ui/Sidebar";
import Navbar from "@/app/component/ui/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Dynamically derive current page name from URL
  const getPageName = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Dashboard"; // /dashboard
    return (
      parts[parts.length - 1].charAt(0).toUpperCase() +
      parts[parts.length - 1].slice(1)
    );
  };

  // Sidebar toggle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle tab navigation from Navbar dropdown (optional)
  const handleSelectTab = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar
          pageName={getPageName()}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onSelectTab={handleSelectTab}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
