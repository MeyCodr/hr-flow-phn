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

  useEffect(() => {
    setMounted(true); // mark that component is mounted on client
  }, []);

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

  if (!mounted) return null; // prevent SSR mismatch

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
      } bg-indigo-800 text-white shadow-md p-4 flex flex-col`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold overflow-hidden">
          <span>HR</span>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap ml-1"
            >
              Dashboard
            </motion.span>
          )}
        </h2>
      </div>

      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 p-2 rounded transition-all ${
                active ? "bg-purple-700 font-semibold" : "hover:bg-purple-600"
              }`}
              onClick={() => isMobile && toggleSidebar()}
            >
              {item.icon}
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
