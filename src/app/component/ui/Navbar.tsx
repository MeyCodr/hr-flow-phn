"use client";

import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AccountDropdown from "./AccountDropdown";
import { useState } from "react";

interface NavbarProps {
  pageName: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSelectTab: (tab: string) => void;
}

export default function Navbar({
  pageName,
  toggleSidebar,
  isSidebarOpen,
  onSelectTab
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="w-full bg-indigo-800 shadow-md flex justify-between items-center px-6 py-4 font-poppins text-white"
    >
      {/* Left: Menu + Page Name */}
      <div className="flex items-center gap-4">
        {/* Menu Icon (hamburger or close) */}
        <AnimatePresence mode="wait">
          <motion.button
            key={isSidebarOpen ? "close" : "menu"}
            onClick={toggleSidebar}
            whileTap={{ scale: 0.9 }}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition text-indigo-800"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </AnimatePresence>

        {/* Page Name */}
        <h1 className="text-xl font-semibold">{pageName}</h1>
      </div>

      {/* Right: Account */}
      <div className="relative">
        <motion.div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileHover={{ scale: 1.05, backgroundColor: "#ffffff20" }}
          className="flex items-center gap-2 cursor-pointer p-1 rounded transition-colors"
        >
          <span className="hidden sm:inline">Account</span>
          <FaUserCircle className="text-2xl text-gray-300 hover:text-white transition-colors" />
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <AccountDropdown onClose={() => setIsDropdownOpen(false)} onSelectTab={onSelectTab}/>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
