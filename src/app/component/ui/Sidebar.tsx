"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaRegUser, FaWpforms } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineApproval } from "react-icons/md";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function Sidebar({
  isOpen,
  toggleSidebar,
  isMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LuLayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Form",
      path: "/dashboard/forms",
      icon: <FaWpforms className="w-5 h-5" />,
    },
    {
      name: "Approval",
      path: "/dashboard/approval",
      icon: <MdOutlineApproval className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <FaRegUser className="w-5 h-5" />,
    },
    {
      name: "Setting",
      path: "/dashboard/setting",
      icon: <IoSettingsSharp className="w-5 h-5" />,
    },
  ];

  if (!mounted) return null;

  return (
    <motion.aside
      animate={{
        width: isMobile ? 256 : isOpen ? 256 : 69,
        x: isMobile ? (isOpen ? 0 : -256) : 0,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 25 }}
      className={`${
        isMobile
          ? "fixed top-0 left-0 h-full z-40"
          : "fixed top-0 left-0 h-screen z-40"
      } bg-indigo-800 text-white shadow-md p-4 flex flex-col overflow-y-auto`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center whitespace-nowrap overflow-hidden">
          <span>HR</span>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-1"
            >
              Dashboard
            </motion.span>
          )}
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => isMobile && toggleSidebar()}
              className={`flex items-center gap-2 p-2 rounded transition-all ${
                active ? "bg-purple-700 font-semibold" : "hover:bg-purple-600"
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                exit={{ opacity: 0, x: -10 }}
                className={`overflow-hidden whitespace-nowrap`}
              >
                {item.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
