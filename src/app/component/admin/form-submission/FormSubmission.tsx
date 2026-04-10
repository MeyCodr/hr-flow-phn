"use client";

import React, { useEffect, useState } from "react";
import { SelfFormData } from "@/app/types/types";
import ViewSubmission from "../../form/ViewSubmission";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { withBasePath } from "@/lib/base-path";

interface FormSubmissionProps {
  formSubmission: SelfFormData[];
}

export default function FormSubmission({
  formSubmission,
}: FormSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<SelfFormData | null>(null);
  const [form, setForm] = useState<SelfFormData[]>(formSubmission);

  const handleRowClick = (form: SelfFormData) => {
    setSelectedForm(form);
  };

  const onBack = () => {
    fetchFormSubmission();
    setSelectedForm(null);
  };

  const fetchFormSubmission = async () => {
    setLoading(true);
    try {
      const res = await axios.get(withBasePath(`/api/form`));
      console.log("res: ", res.data);
      setForm(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormSubmission();
  }, []);

  // Framer Motion variants for animation
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="">
      <AnimatePresence mode="wait">
        {!selectedForm ? (
          <motion.div
            key="list-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="p-6 w-full bg-white rounded-lg border border-gray-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Form Submission
            </h2>

            {loading ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading latest form submission ...
              </p>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[700px] w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-indigo-800 text-white">
                        <th className="px-4 py-3 font-semibold">No</th>
                        <th className="px-4 py-3 font-semibold">Form Name</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">
                          Created by
                        </th>
                        <th className="px-4 py-3 font-semibold text-nowrap">
                          Created at
                        </th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {form.map((form, i) => {
                        return (
                          <tr
                            key={i}
                            onClick={() => handleRowClick(form)}
                            className="hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {form.formType.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {form.createdBy.fullname}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(form.createdAt))}
                            </td>
                            <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">
                              {form.status}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center sm:hidden">
                  👉 Swipe left/right to view more columns
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="details-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
          >
            <ViewSubmission selfForm={selectedForm} onBack={onBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
