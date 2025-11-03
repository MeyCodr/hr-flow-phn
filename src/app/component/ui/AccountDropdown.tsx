"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import LoadingScreen from "./LoadingScreen";

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
    signOut({ callbackUrl: "/" });
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
    "flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700 text-sm cursor-pointer rounded";

  return (
    <>
      <LoadingScreen show={loading} />
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute right-0 top-12 w-52 bg-white border border-gray-300 shadow-md rounded-lg text-black font-poppins z-50"
      >
        <div className="flex flex-col">
          <div className="border-b border-gray-300 px-4 text-sm py-3 font-medium text-gray-700">
            My Account
          </div>
          <button className={buttonLink} onClick={() => handleTab("profile")}>
            <FaUser /> Profile
          </button>
          {/* <button className={buttonLink} onClick={() => handleTab("setting")}>
            <FaCog /> Settings
          </button> */}
          <button
            className={`${buttonLink} border-t border-gray-300 text-red-500`}
            onClick={handleSignOut}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </motion.div>
    </>
  );
}
