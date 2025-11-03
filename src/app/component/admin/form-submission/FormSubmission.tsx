import React, { useState } from "react";
import { FormSubmissionType, SelfFormData } from "@/app/types/types";
import ViewSubmission from "../../form/ViewSubmission";

interface FormSubmissionProps {
  formSubmission: SelfFormData[];
}

export default function FormSubmission({
  formSubmission,
}: FormSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<SelfFormData>();

  console.log("form submission component: ", formSubmission);

  const handleRowClick = (form: SelfFormData) => {
    console.log("form selected: ", form);
    setSelectedForm(form);
  };

  return (
    <div className="">
      {!selectedForm ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Form Submission
          </h2>

          {loading ? (
            <p className="text-center text-sm text-gray-500 py-6">
              Loading latest user listing ...
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
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formSubmission.map((form, i) => (
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
                        <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">
                          {form.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center sm:hidden">
                👉 Swipe left/right to view more columns
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <ViewSubmission  selfForm={selectedForm} />
        </>
      )}
    </div>
  );
}
