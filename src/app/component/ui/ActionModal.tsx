"use client";

import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import PrimaryButton from "./PrimaryButton";

interface ActionModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (remarks: string) => void; // ✅ pass remarks to parent
  onCancel: () => void;
  className?: string;
}

export default function ActionModal({
  isOpen,
  title = "Action Confirmation",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  className,
}: ActionModalProps) {
  const [show, setShow] = useState(false);
  const [remarks, setRemarks] = useState(""); // ✅ local remarks state

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setRemarks(""); // reset each time modal opens
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative transform transition-all duration-300
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-gray-600"
        >
          <IoClose className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

        {/* Message */}
        <p className="text-gray-700 text-sm mb-4">{message}</p>

        {/* ✅ Remarks input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Remarks (optional)
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter your remarks..."
            className="w-full border border-gray-300 rounded-md text-sm p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <PrimaryButton
            name={cancelText}
            onClick={onCancel}
            className={`px-4 py-2 rounded-sm bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs cursor-pointer ${className}`}
          />

          <PrimaryButton
            name={confirmText}
            onClick={() => onConfirm(remarks)} // ✅ pass remarks back
            className={`px-4 py-2 rounded-sm text-white text-xs cursor-pointer ${
              confirmText === "Approve"
                ? "bg-indigo-700 hover:bg-indigo-800"
                : "bg-red-600 hover:bg-red-700"
            } ${className}`}
          />
        </div>
      </div>
    </div>
  );
}
