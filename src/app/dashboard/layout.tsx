"use client";

import Sidebar from "@/app/component/ui/Sidebar";
import Navbar from "@/app/component/ui/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSession } from "next-auth/react";
import { UserType } from "../types/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const { data: session } = useSession();
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
    getUser();
  }, [session]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectTab = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  const getUser = async () => {
    if (!session) return;
    try {
      const res = await axios.get(`/api/user/${session.user.staffid}`);
      setUser(res.data.data);
    } catch (error) {
      console.log(error);
    }
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
          user={user}
        />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </motion.div>
    </div>
  );
}
