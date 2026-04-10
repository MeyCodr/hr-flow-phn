"use client";

import {
  Department,
  Division,
  FormType,
  Section,
  UserType,
} from "@/app/types/types";
import React, { useEffect, useState } from "react";
import ApprovalFlowForm from "./ApprovalFlowForm";
import CheckBox from "../../ui/CheckBox";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmModal from "../../ui/ConfirmModal";
import { withBasePath } from "@/lib/base-path";
import {
  motion,
  AnimatePresence,
  Variants,
  Reorder,
} from "framer-motion";

export interface ApprovalFlowStep {
  id: number;
  createdAt: Date;
  departmentId: number | null;
  divisionId: number | null;
  formTypeId: number;
  order: number;
  role: string;
  sectionId: number | null;
  user?: UserType[];
  formType?: FormType;
  division?: Division;
  department?: Department;
  section?: Section;
  approvalStepApprovers: ApprovalStepApprover[];
}

export interface ApprovalStepApprover {
  id: number;
  stepId: number;
  userId: number;
  user: UserType;
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
  formType,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
}: ApprovalFlowProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedStep, setSelectedStep] = useState<ApprovalFlowStep | null>(
    null,
  );
  const [approvalFlow, setApprovalFlow] = useState<ApprovalFlowStep[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(false);

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
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleDeleteClick = () => {
    if (deleteMode) setShowConfirmModal(true);
    else {
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
    if (!selectedRows.length) return toast.error("No rows selected");
    try {
      setLoading(true);
      await axios.post(withBasePath("/api/approval-flow/delete"), {
        ids: selectedRows,
      });
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
    if (deleteMode) toggleSelect(step.id);
    else {
      setSelectedStep(step);
      setIsAdding(true);
    }
  };

  const fetchApprovalSteps = async () => {
    try {
      setLoading(true);
      const res = await axios.get(withBasePath("/api/approval-flow"));
      const data = res.data;
      setApprovalFlow(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching approval steps:", error);
    } finally {
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

  // Framer Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const grouped = approvalFlow.reduce(
    (acc, step) => {
      const key = step.formTypeId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(step);
      return acc;
    },
    {} as Record<number, ApprovalFlowStep[]>,
  );

  const handleSaveOrder = async (newOrder: ApprovalFlowStep[]) => {
    try {
      console.log("new order: ", newOrder);
      const updated = newOrder.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));

      console.log("update: ", updated);

      await axios.post(withBasePath("/api/approval-flow/update-order"), {
        steps: updated,
      });

      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
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
                      onClick={() => setDragMode((prev) => !prev)}
                      className={`text-xs px-4 py-2 rounded-sm transition cursor-pointer ${
                        dragMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-600 text-white hover:bg-gray-700"
                      }`}
                    >
                      {dragMode ? "Disable Reorder" : "Enable Reorder"}
                    </button>
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
                {/* Header Row */}
                <div
                  className={`w-full grid ${
                    deleteMode ? "grid-cols-8" : "grid-cols-7"
                  } bg-indigo-800 text-white text-xs text-center font-semibold`}
                >
                  {deleteMode && <div className="px-4 py-3">Select</div>}
                  <div className="px-4 py-3 w-full">Form Type</div>
                  <div className="px-4 py-3 w-full">Order</div>
                  <div className="px-4 py-3 w-full">Role</div>
                  <div className="px-4 py-3 w-full">Division</div>
                  <div className="px-4 py-3 w-full">Department</div>
                  <div className="px-4 py-3 w-full">Section</div>
                  <div className="px-4 py-3 w-full">Approver</div>
                </div>

                {/* Body - Optimized for smooth drag control */}
                {Object.entries(grouped).map(([formTypeId, steps]) => {
                  const sortedSteps = [...steps].sort(
                    (a, b) => a.order - b.order,
                  );

                  return (
                    <div
                      key={formTypeId}
                      className="border border-gray-300 mb-4"
                    >
                      {/* Form Type Header */}
                      <div className="bg-gray-100 font-semibold text-gray-700 px-4 py-2 text-sm">
                        {sortedSteps[0]?.formType?.name ?? "No Form Type"}
                      </div>

                      <Reorder.Group
                        axis="y"
                        values={sortedSteps}
                        onReorder={(newSteps) => {
                          const updatedSteps = newSteps.map((step, index) => ({
                            ...step,
                            order: index + 1, // <-- update order here
                          }));

                          setApprovalFlow((prev) => {
                            const others = prev.filter(
                              (s) => s.formTypeId !== Number(formTypeId),
                            );
                            return [...others, ...updatedSteps];
                          });

                          handleSaveOrder(updatedSteps); // save updated order
                        }}
                        className="divide-y divide-gray-200"
                      >
                        {sortedSteps.map((item, index) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 40,
                              mass: 0.8,
                            }}
                            dragListener={dragMode && !deleteMode}
                            dragMomentum={false}
                            whileDrag={{
                              scale: 1.02,
                              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                              zIndex: 100,
                            }}
                            style={{
                              touchAction: dragMode ? "none" : "auto",
                              cursor: dragMode ? "grab" : "default",
                            }}
                            onDragStart={() => setIsDragging(true)}
                            onDragEnd={() => {
                              setTimeout(() => setIsDragging(false), 50);
                            }}
                            onClick={() => {
                              if (!isDragging && !dragMode) {
                                handleRowClick(item);
                              }
                            }}
                            className={`grid ${
                              deleteMode ? "grid-cols-8" : "grid-cols-7"
                            } items-center text-xs text-center transition-colors ${
                              deleteMode
                                ? selectedRows.includes(item.id)
                                  ? "bg-red-50"
                                  : "hover:bg-red-100"
                                : "hover:bg-indigo-50"
                            } ${
                              dragMode
                                ? "cursor-grab active:cursor-grabbing"
                                : ""
                            }`}
                          >
                            {deleteMode && (
                              <div className="px-4 py-3">
                                <CheckBox
                                  checked={selectedRows.includes(item.id)}
                                  onChange={() => toggleSelect(item.id)}
                                />
                              </div>
                            )}

                            <div className="px-4 py-3 text-nowrap text-center">
                              {item.formType?.name}
                            </div>

                            <div className="px-4 py-3 text-center">
                              {index + 1}
                            </div>

                            <div className="px-4 py-3 text-indigo-700 font-medium text-center">
                              {item.role}
                            </div>

                            <div className="px-4 py-3 text-center">
                              {item.division?.name || "-"}
                            </div>

                            <div className="px-4 py-3">
                              {item.department?.name || "-"}
                            </div>

                            <div className="px-4 py-3 text-center">
                              {item.section?.name || "-"}
                            </div>

                            <div className="px-4 py-3 text-center">
                              {item.approvalStepApprovers
                                .sort((a, b) => a.id - b.id)
                                .map((a, i) => (
                                  <div key={a.user?.id ?? i}>
                                    {i + 1}. {a.user?.fullname ?? "No user"}
                                  </div>
                                ))}
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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
