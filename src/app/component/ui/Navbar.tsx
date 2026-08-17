"use client";

import Image from "next/image";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AccountDropdown from "./AccountDropdown";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { getFirstName } from "../../../../lib/utils";
import { UserType } from "@/app/types/types";

interface NavbarProps {
  pageName: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSelectTab: (tab: string) => void;
  isMobile: boolean;
  user: UserType | null;
}

export default function Navbar({
  pageName,
  toggleSidebar,
  isSidebarOpen,
  onSelectTab,
  isMobile,
  user,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0, paddingLeft: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        paddingLeft: !isMobile && isSidebarOpen ? 256 : !isMobile ? 69 : 0,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 25 }}
      className="fixed top-0 left-0 z-30 flex w-full items-center justify-between border-b border-white/10 bg-gradient-to-r from-indigo-950 via-indigo-900 to-[#1e1350] px-6 py-4 font-poppins text-white shadow-lg shadow-black/10"
    >
      <div className="ml-4 flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.button
            key={isSidebarOpen ? "close" : "menu"}
            onClick={toggleSidebar}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="rounded-xl border border-white/10 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </AnimatePresence>

        <div className="flex items-center gap-2.5">
          <span className="hidden h-4 w-1 rounded-full bg-amber-400 sm:block" />
          <h1 className="whitespace-nowrap text-xl font-semibold overflow-hidden">
            {pageName}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative">
          <motion.div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-3 pr-1.5 transition-colors hover:bg-white/10"
          >
            <span className="hidden text-sm font-medium text-indigo-100 sm:inline">
              {user ? getFirstName(user.fullname) : "Account"}
            </span>
            {user?.attachment ? (
              <Image
                src={user.attachment}
                alt="Profile"
                width={32}
                height={32}
                sizes="32px"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <FaUserCircle className="h-8 w-8 text-indigo-300 transition-colors" />
            )}
          </motion.div>

          <AnimatePresence>
            {isDropdownOpen && (
              <AccountDropdown
                onClose={() => setIsDropdownOpen(false)}
                onSelectTab={onSelectTab}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
