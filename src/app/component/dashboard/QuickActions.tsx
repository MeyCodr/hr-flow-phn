"use client";

import Link from "next/link";
import React from "react";
import { FaWpforms } from "react-icons/fa";
import { MdOutlineApproval } from "react-icons/md";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function QuickActions() {
  const actionCards = [
    {
      title: "Submit New Form",
      desc: "Easily submit a new HR form for processing.",
      href: "/dashboard/forms",
      icon: <FaWpforms className="w-6 h-6 mb-4" />,
    },
    {
      title: "View Approvals",
      desc: "Check the status of your pending form approvals.",
      href: "/dashboard/approval",
      icon: <MdOutlineApproval className="w-6 h-6 mb-4" />,
    },
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm"
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-lg font-semibold">Quick Actions</h1>
        <p className="text-indigo-800 text-sm font-light">
          Submit a new form or check pending approvals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {actionCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <motion.div
              custom={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group border border-indigo-100 p-4 flex flex-col justify-center items-center bg-indigo-50 rounded-xl cursor-pointer hover:bg-indigo-800 transition-all duration-300 ease-in-out"
            >
              {React.cloneElement(card.icon, {
                className: "group-hover:text-white w-6 h-6 mb-4",
              })}
              <h2 className="font-medium group-hover:text-white">
                {card.title}
              </h2>
              <p className="text-sm text-gray-500 group-hover:text-white text-center">
                {card.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
