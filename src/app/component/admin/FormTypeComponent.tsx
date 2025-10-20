"use client";

import { useEffect, useState } from "react";
import { FormType } from "@prisma/client";
import FormTypeForm from "./FormTypeForm";
import axios from "axios";

interface FormTypeComponentProps {
  formType: FormType[];
}

export default function FormTypeComponent({
  formType,
}: FormTypeComponentProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [forms, setForms] = useState<FormType[]>(formType);
  const [loading, setLoading] = useState(false);

  const handleAddForm = () => setIsAdding(true);
  const handleBack = () => setIsAdding(false);

  // ✅ Fetch latest list from API
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

  // ✅ Always fetch fresh data when tab mounts
  useEffect(() => {
    fetchFormType();
  }, []);

  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-300">
      {!isAdding ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Form Type
              </h2>
            </div>

            <button
              onClick={handleAddForm}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
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
                  <tr className="bg-indigo-600 text-white">
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
        </>
      ) : (
        // ✅ When saved, re-fetch fresh list
        <FormTypeForm onBack={handleBack} onSuccess={fetchFormType} />
      )}
    </div>
  );
}
