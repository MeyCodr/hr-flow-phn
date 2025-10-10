"use client";

import { useState, useEffect, JSX, useCallback } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// Dummy tab components
function DashboardTab() {
  return <div>Dashboard Content</div>;
}
function FormTab() {
  return <div>Form Content</div>;
}
function ApprovalTab() {
  return <div>Approval Content</div>;
}
function ProfileTab() {
  return <div>Profile Content</div>;
}
function SettingTab() {
  return <div>Setting Content</div>;
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // map tab keys to urls
  const tabToUrl: Record<string, string> = {
    dashboard: "/",
    form: "/form",
    approval: "/approval",
    profile: "/profile",
    setting: "/setting",
  };

  // derive tab name from current pathname
  const getTabFromPath = useCallback((): string => {
    if (pathname.startsWith("/form")) return "form";
    if (pathname.startsWith("/approval")) return "approval";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/setting")) return "setting";
    return "dashboard";
  }, [pathname]);

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  // keep tab in sync with URL
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [pathname, getTabFromPath]);

  // handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tabToUrl[tab]); // ✅ client-side navigation
  };

  // detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabComponents: Record<string, JSX.Element> = {
    dashboard: <DashboardTab />,
    form: <FormTab />,
    approval: <ApprovalTab />,
    profile: <ProfileTab />,
    setting: <SettingTab />,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        // activeTab={activeTab}
        // onSelectTab={handleTabChange}
      />

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20"
        />
      )}

      {/* Main content */}
      <motion.div
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className="flex-1 flex flex-col relative z-10"
      >
        <Navbar
          isMobile={isMobile}
          pageName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectTab={handleTabChange}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={activeTab}
            className="flex-1 p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tabComponents[activeTab]}
          </motion.main>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
