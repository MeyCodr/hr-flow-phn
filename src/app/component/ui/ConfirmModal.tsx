"use client";

import React from "react";
import PrimaryButton from "./PrimaryButton"; // Your button component
import { IoClose } from "react-icons/io5";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm",
  message,
  onConfirm,
  onCancel,
  okText,
  cancelText,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <PrimaryButton
            name={cancelText ?? ""}
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 text-xs  cursor-pointer rounded-sm hover:bg-gray-300"
          />
          <PrimaryButton
            name={okText ?? ""}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-4 py-2 text-xs rounded-sm"
          />
        </div>
      </div>
    </div>
  );
}
