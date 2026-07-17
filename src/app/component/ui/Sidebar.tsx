"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CiUser } from "react-icons/ci";
import { PiFlowArrowThin } from "react-icons/pi";
import { IoDocumentsOutline } from "react-icons/io5";
import { PiChalkboardSimpleLight } from "react-icons/pi";
import { CiLock } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import { UserType } from "@/app/types/types";
import { useSession } from "next-auth/react";
import { TbBrandGoogleAnalytics, TbReportAnalytics } from "react-icons/tb";
import { GrUserWorker } from "react-icons/gr";
import axios from "axios";
import { withBasePath } from "@/lib/base-path";
import { canViewAnalytics } from "@/lib/analytics-access";

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
  const [user, setUser] = useState<UserType>();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(
    pathname.startsWith("/dashboard/manpower-analytics") ||
      pathname.startsWith("/dashboard/form-insights"),
  );
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (
      pathname.startsWith("/dashboard/manpower-analytics") ||
      pathname.startsWith("/dashboard/form-insights")
    ) {
      setIsAnalyticsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!session) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          withBasePath(`/api/user/${session.user.staffid}`),
        );
        const user = res.data.data;
        setUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [session]);

  const showAnalytics = canViewAnalytics(user?.role);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <PiChalkboardSimpleLight className="w-5 h-5" />,
    },
    {
      name: "Analytics",
      path: "",
      icon: <TbBrandGoogleAnalytics className="w-5 h-5" />,
      children: [
        {
          name: "Manpower",
          path: "/dashboard/manpower-analytics",
          icon: <GrUserWorker className="h-4 w-4" />,
        },
        {
          name: "Form Insights",
          path: "/dashboard/form-insights",
          icon: <TbReportAnalytics className="h-4 w-4" />,
        },
      ],
    },
    {
      name: "Form",
      path: "/dashboard/forms",
      icon: <IoDocumentsOutline className="w-5 h-5" />,
    },
    {
      name: "Approval",
      path: "/dashboard/approval",
      icon: <PiFlowArrowThin className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <CiUser className="w-5 h-5" />,
    },
    // {
    //   name: "Setting",
    //   path: "/dashboard/setting",
    //   icon: <CiSettings  className="w-5 h-5" />,
    // },
    {
      name: "Admin",
      path: "/dashboard/admin",
      icon: <CiLock className="w-5 h-5" />,
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
          <span>PHN</span>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-1"
            >
              HR FMS
            </motion.span>
          )}
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 mt-4">
        {menuItems
          .filter((item) => {
            if (item.name === "Analytics" && !showAnalytics) {
              return false;
            }

            // Only show Admin tab if the user role is ADMIN or COMPLIANCE_ADMIN
            if (item.name === "Admin" && user?.role !== "ADMIN" && user?.role !== "COMPLIANCE_ADMIN") {
              return false;
            }

            return true;
          })
          .map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const active = hasChildren
              ? item.children?.some((child) => pathname.startsWith(child.path))
              : pathname === item.path;

            if (hasChildren) {
              return (
                <div key={item.path} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setIsAnalyticsOpen((prev) => !prev)}
                    className={`flex w-full items-center gap-2 rounded p-2 text-sm transition-all ${
                      active
                        ? "bg-purple-700 font-semibold"
                        : "hover:bg-purple-600"
                    }`}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
                    >
                      <span>{item.name}</span>
                      <FaChevronDown
                        className={`h-3 w-3 transition-transform ${
                          isAnalyticsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && isAnalyticsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="ml-7 mt-1 overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 pb-1">
                          {item.children?.map((child) => {
                            const childActive = pathname === child.path;

                            return (
                              <motion.div
                                key={child.path}
                                initial={{ y: -6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -6, opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                              >
                                <Link
                                  href={child.path}
                                  onClick={() => isMobile && toggleSidebar()}
                                  className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-all ${
                                    childActive
                                      ? "bg-purple-600 font-semibold text-white"
                                      : "text-indigo-100 hover:bg-purple-600 hover:text-white"
                                  }`}
                                >
                                  <span className="flex-shrink-0">
                                    {child.icon}
                                  </span>
                                  {child.name}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => isMobile && toggleSidebar()}
                className={`flex items-center gap-2 p-2 text-sm rounded transition-all ${
                  active ? "bg-purple-700 font-semibold" : "hover:bg-purple-600"
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden whitespace-nowrap"
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
