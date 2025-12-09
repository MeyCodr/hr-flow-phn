"use client";

import { useEffect, useState } from "react";
import { FormType } from "@/generated/client";
import FormTypeForm from "./FormTypeForm";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface FormTypeComponentProps {
  formType: FormType[];
}

export default function FormTypeComponent({
  formType,
}: FormTypeComponentProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [forms, setForms] = useState<FormType[]>(formType);
  const [loading, setLoading] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<FormType | null>(
    null
  );

  const handleAddForm = () => {
    setSelectedFormType(null);
    setIsAdding(true);
  };
  const handleBack = () => setIsAdding(false);

  const fetchFormType = async () => {
    try {
      setLoading(true);
      const res = await axios.get<FormType[]>(`/api/form-type`);
      setForms(res.data);
      setIsAdding(false);
    } catch (error) {
      console.error("Error fetching form types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormType();
  }, []);

  const handleRowClick = (formType: FormType) => {
    setSelectedFormType(formType);
    setIsAdding(true);
  };

  // Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-300">
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="table-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Form Type</h2>
              <button
                onClick={handleAddForm}
                className="bg-indigo-800 text-white text-xs px-4 py-2 rounded-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                + Add Form
              </button>
            </div>

            {loading ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading latest form types...
              </p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="min-w-[500px] w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-indigo-800 text-white">
                      <th className="px-4 py-3 font-semibold">No</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Created Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {forms.length > 0 ? (
                      forms.map((item, i) => (
                        <tr
                          key={item.id}
                          className="hover:bg-indigo-50 transition cursor-pointer"
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )
                              : ""}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-500 py-4 italic"
                        >
                          No form types available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3 text-center sm:hidden">
              👉 Swipe left/right to view more columns
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
          >
            <FormTypeForm
              onBack={handleBack}
              onSuccess={fetchFormType}
              selectedFormType={selectedFormType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
