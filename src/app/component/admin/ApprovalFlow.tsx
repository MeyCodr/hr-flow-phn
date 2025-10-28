"use client";

import { Department, Division, FormType, Section } from "@/app/types/types";
import React, { useEffect, useState } from "react";
import ApprovalFlowForm from "./ApprovalFlowForm";
import CheckBox from "../ui/CheckBox";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmModal from "../ui/ConfirmModal";

export interface ApprovalFlowStep {
  id: number;
  createdAt: Date;
  departmentId: number | null;
  divisionId: number | null;
  formTypeId: number;
  order: number;
  role: string;
  sectionId: number | null;

  formType?: FormType;
  division?: Division;
  department?: Department;
  section?: Section;
}

interface ApprovalFlowProps {
  approvalStep: ApprovalFlowStep[];
  formType: FormType[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: (id: string) => void;
  setSelectedDepartment: (id: string) => void;
}

export default function ApprovalFlow({
  // approvalStep,
  formType,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
}: ApprovalFlowProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false); // ✅ NEW

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedStep, setSelectedStep] = useState<ApprovalFlowStep | null>(
    null
  );
  const [approvalFlow, setApprovalFlow] = useState<ApprovalFlowStep[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddForm = () => {
    setSelectedStep(null);
    setIsAdding(true);
  };
  const handleBack = () => {
    setIsAdding(false);
    setDeleteMode(false);
  };

  const toggleSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = () => {
    if (deleteMode) {
      // Show modal instead of JS confirm
      setShowConfirmModal(true);
    } else {
      setDeleteMode(true);
      toast("Select rows to delete");
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    await handleDeleteSelected();
  };

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedRows([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return toast.error("No rows selected");

    try {
      setLoading(true);
      await axios.post("/api/approval-flow/delete", { ids: selectedRows });
      toast.success("Deleted successfully");
      setDeleteMode(false);
      setSelectedRows([]);
      await fetchApprovalSteps();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (step: ApprovalFlowStep) => {
    if (deleteMode) {
      // Only toggle selection during delete mode
      toggleSelect(step.id);
    } else {
      setSelectedStep(step);
      setIsAdding(true);
    }
  };

  const fetchApprovalSteps = async () => {
    try{
      setLoading(true);
       const res = await axios.get("/api/approval-flow");
    const data = res.data;
    setApprovalFlow(Array.isArray(data) ? data : []);
    }catch(error){
      console.error("Error fetching approval steps:", error);
    }finally{
      setLoading(false);
    }
   
  };

  useEffect(() => {
    fetchApprovalSteps();
  }, []);

  const handleNewData = async () => {
    await fetchApprovalSteps();
    setIsAdding(false);
  };

  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-300">
      {!isAdding ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Approval Step
            </h2>

            <div className="flex items-center gap-2">
              {deleteMode ? (
                <>
                  <button
                    onClick={handleDeleteClick}
                    disabled={loading}
                    className="bg-red-600 text-white text-xs px-4 py-2 rounded-sm hover:bg-red-700 transition cursor-pointer disabled:bg-gray-400"
                  >
                    {loading
                      ? "Deleting..."
                      : `Confirm Delete (${selectedRows.length})`}
                  </button>
                  <button
                    onClick={cancelDeleteMode}
                    className="bg-gray-300 text-gray-800 text-xs px-4 py-2 rounded-sm hover:bg-gray-400 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDeleteClick}
                    className="bg-red-600 text-white text-xs px-4 py-2 rounded-sm hover:bg-red-700 transition cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleAddForm}
                    className="bg-indigo-800 text-white text-xs px-4 py-2 rounded-sm hover:bg-indigo-700 transition cursor-pointer"
                  >
                    + Add Step
                  </button>
                </>
              )}
            </div>
          </div>

          {loading ? (
             <p className="text-center text-sm text-gray-500 py-6">
              Loading latest approval flow steps ...
            </p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-[700px] w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-indigo-800 text-white">
                    {deleteMode && (
                      <th className="px-4 py-3 font-semibold">Select</th>
                    )}
                    <th className="px-4 py-3 font-semibold">Form Type</th>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Division</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Section</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {approvalFlow.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition cursor-pointer ${
                        deleteMode
                          ? selectedRows.includes(item.id)
                            ? "bg-red-50"
                            : "hover:bg-red-100"
                          : "hover:bg-indigo-50"
                      }`}
                      onClick={() => handleRowClick(item)}
                    >
                      {deleteMode && (
                        <td className="px-4 py-3">
                          <CheckBox
                            checked={selectedRows.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.formType?.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.order}
                      </td>
                      <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">
                        {item.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.division?.name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.department?.name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.section?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <ApprovalFlowForm
          handleBack={handleBack}
          onUpdate={handleNewData}
          formType={formType}
          divisions={divisions}
          departments={departments}
          sections={sections}
          setSelectedDivision={setSelectedDivision}
          setSelectedDepartment={setSelectedDepartment}
          selectedStep={selectedStep}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        message={`Are you sure you want to delete ${selectedRows.length} selected approval step(s)?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        cancelText="Cancel"
        okText="Delete"
        title="Are you sure you want to delete this step?"
      />
    </div>
  );
}
