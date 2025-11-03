"use client";

import React from "react";
import { motion } from "framer-motion";
import DashboardCard from "./DashboardCard";
import { FiFileText, FiCheckCircle, FiUsers, FiLayers } from "react-icons/fi";
import QuickActions from "./QuickActions";
import { getFirstName } from "../../../../lib/utils";
import { Session } from "next-auth";
import type { Variants } from "framer-motion";

interface DashboardComponentProps {
  countPendingForms: number;
  countApprovedForms: number;
  totalForms: number;
  totalMembers: number;
  userSession: Session | null;
}

export default function DashboardComponent({
  countPendingForms,
  countApprovedForms,
  totalForms,
  totalMembers,
  userSession,
}: DashboardComponentProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
      return `Good morning, ${
        getFirstName(userSession?.user.name) || "User"
      }! ☀️`;
    if (hour >= 12 && hour < 18)
      return `Good afternoon, ${
        getFirstName(userSession?.user.name) || "User"
      }! 🌤️`;
    if (hour >= 18 && hour < 22)
      return `Good evening, ${
        getFirstName(userSession?.user.name) || "User"
      }! 🌙`;
    return `Hello, ${getFirstName(userSession?.user.name) || "User"}! 🌟`;
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1], // equivalent to "easeOut"
      },
    }),
  };

  return (
    <div className="font-poppins w-full">
      {/* Greeting */}
      <div>
        <h1 className="font-bold text-3xl">{getGreeting()}</h1>
        <p className="text-indigo-800 mt-1">
          Welcome back! Here&apos;s a quick overview of your HR forms today.
        </p>
      </div>

      {/* Animated Dashboard Grid */}
      <motion.div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 my-6"
        initial="hidden"
        animate="visible"
      >
        {[
          {
            name: "Pending Forms",
            count: countPendingForms,
            icon: <FiFileText />,
            color: "yellow",
            nameColor: "yellow-600",
          },
          {
            name: "Approved",
            count: countApprovedForms,
            icon: <FiCheckCircle />,
            color: "green",
            nameColor: "green-600",
          },
          {
            name: "Total Forms",
            count: totalForms,
            icon: <FiLayers />,
            color: "blue",
            nameColor: "blue-600",
          },
          {
            name: "Total Members",
            count: totalMembers,
            icon: <FiUsers />,
            color: "purple",
            nameColor: "purple-600",
          },
        ].map((card, index) => (
          <motion.div key={index} variants={cardVariants} custom={index}>
            <DashboardCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      <div>
        <QuickActions />
      </div>
    </div>
  );
}
