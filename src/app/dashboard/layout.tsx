"use client";

import Sidebar from "@/app/component/ui/Sidebar";
import Navbar from "@/app/component/ui/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getPageName = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Dashboard";
    return (
      parts[parts.length - 1].charAt(0).toUpperCase() +
      parts[parts.length - 1].slice(1)
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectTab = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-y-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20"
        />
      )}

      {/* Main content area animated with Framer Motion */}
      <motion.div
        animate={{
          marginLeft: !isMobile && isSidebarOpen ? 256 : !isMobile ? 69 : 0,
          marginTop: 68,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className="flex-1 flex flex-col"
      >
        <Navbar
          isMobile={isMobile}
          pageName={getPageName()}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onSelectTab={handleSelectTab}
        />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </motion.div>
    </div>
  );
}
