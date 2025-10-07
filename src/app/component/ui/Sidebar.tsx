"use client";

import { FaHome, FaUser, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void; // now updates URL
}

export default function Sidebar({
  isOpen,
  toggleSidebar,
  isMobile,
  activeTab,
  onSelectTab,
}: SidebarProps) {
  const menuItems = [
    {
      name: "Dashboard",
      key: "dashboard",
      icon: <FaHome className="w-5 h-5" />,
    },
    { name: "Form", key: "form", icon: <FaUser className="w-5 h-5" /> },
    { name: "Approval", key: "approval", icon: <FaUser className="w-5 h-5" /> },
    { name: "Profile", key: "profile", icon: <FaUser className="w-5 h-5" /> },
    { name: "Setting", key: "setting", icon: <FaUser className="w-5 h-5" /> },
  ];

  return (
    <motion.aside
      animate={{
        x: isMobile ? (isOpen ? 0 : -256) : 0,
        width: isMobile ? 256 : isOpen ? 256 : 69,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 25 }}
      className={`${
        isMobile
          ? "fixed top-0 left-0 h-full z-40"
          : "fixed top-0 left-0 h-screen md:relative"
      } bg-indigo-800 shadow-md p-4 font-poppins text-white flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-1 overflow-hidden">
          <span>HR</span>
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            className="whitespace-nowrap overflow-hidden"
            transition={{ duration: 0.3 }}
          >
            Dashboard
          </motion.span>
        </h2>

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-indigo-800"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-3 mt-4 flex-1">
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onSelectTab(item.key)} // SPA + URL update
            className={`flex items-center gap-2 p-2 rounded hover:bg-purple-600 transition-all cursor-pointer ${
              activeTab === item.key ? "bg-purple-700 font-semibold" : ""
            }`}
          >
            <div className="flex justify-center w-6">{item.icon}</div>
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
              className="whitespace-nowrap overflow-hidden transition-all duration-300"
            >
              {item.name}
            </motion.span>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
