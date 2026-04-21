"use client";

import React, { useEffect, useState } from "react";
import PrimaryButton from "../../ui/PrimaryButton";
import { IoReturnDownBack } from "react-icons/io5";
import Label from "../../ui/Label";
import { Input } from "../../ui/Input";
import axios from "axios";
import { FormType } from "@/generated/client";

import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "../../ui/ConfirmModal";
import { withBasePath } from "@/lib/base-path";

interface FormTypeFormProps {
  onBack: () => void;
  onSuccess: (newForm: FormType) => void; // ✅ new prop
  selectedFormType?: FormType | null; // ✅ new prop
}

export default function FormTypeForm({
  onBack,
  onSuccess,
  selectedFormType,
}: FormTypeFormProps) {
  const [data, setData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const styleLink = `flex flex-col gap-y-2`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.name.trim()) {
      alert("Please enter form name");
      return;
    }

    setLoading(true);
    try {
      const url = selectedFormType
        ? withBasePath(`/api/form-type/${selectedFormType.id}`)
        : withBasePath(`/api/form-type`);
      const method = selectedFormType ? axios.put : axios.post;
      const res = await method(url, data);
      if (method === axios.post) {
        toast.success("Form type added successfully");
      } else {
        toast.success("Form type updated successfully");
      }
      onSuccess(res.data); // ✅ send back to parent
    } catch (error) {
      console.error(error);
      toast.error("Failed to save form type");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedFormType) return;
      const res = await axios.delete(
        withBasePath(`/api/form-type/${selectedFormType.id}`),
      );
      if (res.status === 200) {
        toast.success("Form type deleted successfully");
        onSuccess(res.data);
        onBack();
      }
    } catch (e) {
      console.error("Failed to delete form type:", e);
      toast.error("Failed to delete form type");
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    await handleDelete();
  };

  useEffect(() => {
    if (selectedFormType) {
      setData({
        name: selectedFormType.name,
        description: selectedFormType.description ?? "",
      });
    }
  }, [selectedFormType]);

  return (
    <div>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Add New Form Type
        </h2>
        <PrimaryButton
          name="Back to list"
          icon={<IoReturnDownBack className="w-5 h-5" />}
          onClick={onBack}
          className="text-indigo-800 hover:text-indigo-500 text-xs font-medium cursor-pointer"
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className={styleLink}>
          <Label
            name="Form Name"
            htmlFor="name"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="name"
            name="name"
            type="text"
            value={data.name}
            onChange={handleChange}
            placeholder="Form Name"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className={styleLink}>
          <Label
            name="Description"
            htmlFor="description"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="description"
            name="description"
            type="text"
            value={data.description}
            onChange={handleChange}
            placeholder="Form Description"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-x-2">
          {selectedFormType && (
            <PrimaryButton
              name={loading ? "Deleting" : "Delete"}
              type="button"
              disabled={loading}
              onClick={handleDeleteClick}
              className="bg-red-600 text-white text-xs px-4 py-2 rounded-sm hover:bg-red-700 transition cursor-pointer"
            />
          )}

          <PrimaryButton
            name={loading ? "Saving..." : "Save"}
            type="submit"
            disabled={loading}
            className="bg-indigo-800 max-w-3xs flex text-xs cursor-pointer text-white px-4 py-2 rounded-sm hover:bg-indigo-700"
          />
        </div>
      </form>
      <ConfirmModal
        isOpen={showConfirmModal}
        message={`Are you sure you want to delete this form?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        cancelText="Cancel"
        okText="Delete"
        title="Are you sure you want to delete this form?"
      />
    </div>
  );
}
