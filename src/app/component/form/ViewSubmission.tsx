"use client";

import React, { useEffect, useState } from "react";
import { IoReturnDownBack } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import axios from "axios";
import { useSession } from "next-auth/react";

import {
  ApprovalUser,
  Department,
  Division,
  fullUserInfo,
  Section,
  SelfFormData,
  User,
} from "@/app/types/types";
import { FormStatus } from "@prisma/client";
import { getFormRemarks, sanitizeName } from "../../../../lib/utils";
import { downloadFormPDF } from "../../../../lib/pdfDownloader";
import { HrFormComponents } from "../../../../lib/hrformcomponents";

import LoadingScreen from "../ui/LoadingScreen";
import PrimaryButton from "../ui/PrimaryButton";
import ActionModal from "../ui/ActionModal";
import Label from "../ui/Label";
import { TextArea } from "../ui/TextArea";
import { Approval } from "../approval/ApprovalComponent";

interface ViewSubmissionProps {
  onBack?: () => void;
  selfForm: SelfFormData;
  onActionComplete?: () => void;
}

type EditedApproval = {
  status: FormStatus;
  remarks?: string | null;
};

export default function ViewSubmission({
  onBack,
  selfForm,
  onActionComplete,
}: ViewSubmissionProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [, setSelectedSection] = useState<string>("");
  const [, setSelectedWorkLocation] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [userSession, setUserSession] = useState<fullUserInfo>();
  const [editedApprovals, setEditedApprovals] = useState<
    Record<number, EditedApproval>
  >({});
  const [form, setForm] = useState<SelfFormData>(selfForm);
  const [loading, setLoading] = useState(false);

  const sanitizedKey = sanitizeName(form.formType.name);
  const FormComponent = HrFormComponents[sanitizedKey];

  useEffect(() => {
    if (session) setUser(session.user);
  }, [session]);

  useEffect(() => {
    axios
      .get("/api/division")
      .then((res) => setDivisions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      axios
        .get(`/api/department?divisionId=${selectedDivision}`)
        .then((res) => {
          setDepartments(res.data);
          setSections([]);
        })
        .catch(console.error);
    } else {
      setDepartments([]);
      setSections([]);
    }

    setSelectedDepartment("");
    setSelectedSection("");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(`/api/section?departmentId=${selectedDepartment}`)
        .then((res) => setSections(res.data))
        .catch(console.error);
    } else {
      setSections([]);
    }

    setSelectedSection("");
  }, [selectedDepartment]);

  useEffect(() => {
    if (user) findUser();
  }, [user]);

  const findUser = async () => {
    try {
      const res = await axios.get(`/api/user/${user?.staffid}`);
      setUserSession(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const nextApproval = form.approvals?.find((a) => a.status === "PENDING");

  const isFormCompleted =
    form.status === "APPROVED" || form.status === "REJECTED";

  const canApprove =
    !isFormCompleted && nextApproval?.approverId === userSession?.id;

  const handleActionClick = (type: "approve" | "reject") => {
    setActionType(type);
    setConfirmModalOpen(true);
  };

  const performApproval = async () => {
    if (!actionType) return;
    setLoading(true);
    try {
      await axios.post("/api/approval-form/action", {
        approvalId: nextApproval?.id,
        action: actionType,
        remarks: getFormRemarks(form.formData),
      });
      if (onActionComplete) await onActionComplete();
      if (onBack) await onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to perform action");
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setActionType(null);
    }
  };

  const mappedApprovals: ApprovalUser[] = form.approvals.map((a, index) => ({
    id: a.id,
    submissionId: form.id,
    approverId: a.approverId,
    status: a.status as "PENDING" | "APPROVED" | "REJECTED" | "WAITING",
    stepOrder: index + 1,
    remarks: a.remarks || null,
    approvedAt: a.approvedAt || null,
    approver: a.approver
      ? {
          staffid: a.approver.staffid,
          email: a.approver.email,
          name: a.approver.fullname,
        }
      : undefined,
  }));

  const handleAdminStatusChange = (id: number, newStatus: FormStatus) => {
    setEditedApprovals((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: newStatus },
    }));
  };

  const handleAdminApprovalSave = async (approval: Approval) => {
    const edited = editedApprovals[approval.id];
    if (!edited?.status) return;

    try {
      setLoading(true);
      await axios.put(`/api/form/${approval.id}`, {
        newStatus: edited.status,
        formId: form.id,
      });
      await fetchForm();
      alert("Approval status updated successfully!");
      if (onActionComplete) await onActionComplete();
    } catch (error) {
      console.error(error);
      alert("Failed to update approval status");
    } finally {
      setLoading(false);
    }
  };

  const fetchForm = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/form/${selfForm.id}`);
      setForm(res.data);
      setEditedApprovals({});
    } catch (error) {
      console.error("Failed to fetch form:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <p className="text-center text-sm text-gray-500 py-6">
        Loading form data ...
      </p>
    );
  }

  return (
    <>
      <LoadingScreen show={loading} />
      <div className="bg-white my-6 p-6 rounded-lg border border-gray-300 shadow-xs">
        {/* Header */}
        <div className="mb-4 flex justify-between">
          <PrimaryButton
            name="Back to list"
            icon={<IoReturnDownBack className="w-5 h-5" />}
            onClick={onBack}
            className="text-indigo-800 hover:text-indigo-500 text-xs font-medium cursor-pointer"
          />
          <div className="flex gap-x-4">
            <span
              className={` px-4 py-2 text-xs font-semibold rounded ${
                form.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : form.status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {form.status}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {form.formType.name}
            </h1>
            <p className="text-xs text-indigo-800 font-light">
              This form is strictly for reference/viewing.
            </p>
          </div>

          <PrimaryButton
            name="Download PDF"
            onClick={() =>
              downloadFormPDF({
                formData: form.formData,
                departmentName: form.departmentName ?? "",
                divisionName: form.divisionName ?? "",
                sectionName: form.sectionName ?? "",
                createdBy: form.createdBy,
                approvals: mappedApprovals,
              })
            }
            className="bg-purple-700 text-white px-3 py-2 text-xs rounded-sm hover:bg-purple-900 cursor-pointer"
            icon={<MdOutlineFileDownload className="w-5 h-5" />}
          />
        </div>

        <div>
          {/* Dynamic Form Rendering */}
          {FormComponent ? (
            <FormComponent
              formId={form.id}
              selfForm={form}
              user={user}
              divisions={divisions}
              departments={departments}
              sections={sections}
              setSelectedDivision={setSelectedDivision}
              setSelectedDepartment={setSelectedDepartment}
              setSelectedSection={setSelectedSection}
              setSelectedWorkLocation={setSelectedWorkLocation}
              readOnly={true}
            />
          ) : (
            <p className="text-sm text-gray-500">Form type not supported.</p>
          )}

          {/* Approve / Reject Buttons */}
          {canApprove && (
            <div className="flex gap-x-4 justify-end mt-4">
              <PrimaryButton
                name="Reject"
                type="button"
                onClick={() => handleActionClick("reject")}
                className="border border-red-600 bg-red-600 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-red-700 hover:border-red-700 transition-all"
              />
              <PrimaryButton
                name="Approve"
                type="button"
                onClick={() => handleActionClick("approve")}
                className="border border-indigo-800 bg-indigo-800 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-indigo-700 hover:border-indigo-700 transition-all"
              />
            </div>
          )}

          <ActionModal
            isOpen={confirmModalOpen}
            title={`Do you want to ${
              actionType === "approve" ? "approve" : "reject"
            } this form?`}
            message={`Please check the details of the form carefully. Once ${
              actionType === "approve" ? "approved" : "rejected"
            }, this action cannot be undone.`}
            onConfirm={performApproval}
            onCancel={() => setConfirmModalOpen(false)}
            confirmText={actionType === "approve" ? "Approve" : "Reject"}
            cancelText="Cancel"
          />
        </div>
      </div>

      {/* Approval Timeline */}
      {form.approvals && form.approvals.length > 0 && (
        <div className="mt-10">
          <div className="mb-6">
            <h1 className="font-semibold text-lg text-gray-800">
              Approval Timeline
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Track each approval step and its remarks below.
            </p>
          </div>

          <div className="relative border-l border-gray-300 pl-6 space-y-8">
            {form.approvals.map((approval, index) => (
              <div key={approval.id} className="relative">
                <div
                  className={`absolute -left-[10px] top-1 w-4 h-4 rounded-full border-2 ${
                    approval.status === "APPROVED"
                      ? "border-green-600 bg-green-100"
                      : approval.status === "REJECTED"
                      ? "border-red-600 bg-red-100"
                      : "border-yellow-500 bg-yellow-100"
                  }`}
                ></div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Level {index + 1} —{" "}
                        {approval.approver?.fullname || "Approver"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {approval.approvedAt
                          ? new Date(approval.approvedAt).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )
                          : "Pending approval"}
                      </p>
                    </div>

                    {userSession?.role === "ADMIN" ? (
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer"
                        value={
                          editedApprovals[approval.id]?.status ||
                          approval.status
                        }
                        onChange={(e) =>
                          handleAdminStatusChange(
                            approval.id,
                            e.target.value as FormStatus
                          )
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="WAITING">WAITING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    ) : (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          approval.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : approval.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {approval.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label
                      name="Remarks"
                      htmlFor={`remarks-${approval.id}`}
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    />
                    <TextArea
                      id={`remarks-${approval.id}`}
                      value={approval.remarks || "No remarks provided."}
                      disabled
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-800 text-xs bg-gray-50 resize-none focus:outline-none"
                      name="remarks"
                      onChange={() => {}}
                      placeholder={""}
                    />

                    {userSession?.role === "ADMIN" && (
                      <PrimaryButton
                        name="Save Changes"
                        type="button"
                        className="mt-2 text-xs bg-purple-700 text-white px-3 py-2 rounded hover:bg-purple-900 cursor-pointer"
                        onClick={() => handleAdminApprovalSave(approval)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
