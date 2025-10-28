import Link from "next/link";
import React from "react";
import { FaWpforms } from "react-icons/fa";
import { MdOutlineApproval } from "react-icons/md";

export default function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">Quick Actions</h1>
        <p className="text-indigo-800 text-sm font-light">
          Submit a new form or check pending approvals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Submit New Form */}
        <Link href={"/dashboard/forms"}>
          <div className="group border border-indigo-100 p-4 flex flex-col justify-center items-center bg-indigo-50 rounded-xl hover:bg-indigo-800 transition-all duration-300 ease-in-out cursor-pointer">
            <FaWpforms className="group-hover:text-white w-6 h-6 mb-4" />

            <h2 className="font-medium group-hover:text-white">
              Submit New Form
            </h2>
            <p className="text-sm text-gray-500 group-hover:text-white text-center">
              Easily submit a new HR form for processing.
            </p>
          </div>
        </Link>
        {/* View Approvals */}
        <Link href={"/dashboard/approval"}>
          <div className="group border border-indigo-100 p-4 flex flex-col justify-center items-center bg-indigo-50 rounded-xl hover:bg-indigo-800 transition-all duration-300 ease-in-out cursor-pointer">
            <MdOutlineApproval className="group-hover:text-white w-6 h-6 mb-4" />
            <h2 className="font-medium group-hover:text-white">
              View Approvals
            </h2>
            <p className="text-sm text-gray-500 group-hover:text-white text-center">
              Check the status of your pending form approvals.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
