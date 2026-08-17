"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import { withBasePath } from "@/lib/base-path";

interface AccountDropdownProps {
  onClose?: () => void;
  onSelectTab: (tab: string) => void;
}

export default function AccountDropdown({
  onClose,
  onSelectTab,
}: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    if (onClose) onClose();
    setLoading(true);
    signOut({ callbackUrl: withBasePath("/") });
  };

  const handleTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    if (onClose) onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const buttonLink =
    "flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-gray-700 dark:text-gray-200 text-sm cursor-pointer rounded-lg mx-1.5";

  return (
    <>
      <LoadingScreen show={loading} />
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute right-0 top-12 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-gray-100 shadow-xl shadow-black/10 font-poppins z-50 overflow-hidden"
      >
        <div className="flex flex-col py-1.5">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            My Account
          </div>
          <button className={`${buttonLink} mt-1`} onClick={() => handleTab("profile")}>
            <FaUser className="text-indigo-800 dark:text-indigo-400" /> Profile
          </button>
          {/* <button className={buttonLink} onClick={() => handleTab("setting")}>
            <FaCog /> Settings
          </button> */}
          <button
            className={`${buttonLink} mb-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40`}
            onClick={handleSignOut}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </motion.div>
    </>
  );
}
