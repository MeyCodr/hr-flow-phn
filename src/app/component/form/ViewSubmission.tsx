import React, { useEffect, useState } from "react";

import { IoReturnDownBack } from "react-icons/io5";

import {
  ApprovalUser,
  Department,
  Division,
  fullUserInfo,
  Section,
  SelfFormData,
  User,
} from "@/app/types/types";
import axios from "axios";
import { useSession } from "next-auth/react";

import { Prisma } from "@prisma/client";
import { Approval } from "../approval/ApprovalComponent";
import { getFormRemarks } from "../../../../lib/utils";
import LoadingScreen from "../ui/LoadingScreen";
import PrimaryButton from "../ui/PrimaryButton";
import { downloadFormPDF } from "../../../../lib/pdfDownloader";
import { MdOutlineFileDownload } from "react-icons/md";
import ManPowerRequisitionView from "./hr-form/view/ManPowerRequisitionView";
import ActionModal from "../ui/ActionModal";
import Label from "../ui/Label";
import { TextArea } from "../ui/TextArea";



interface ViewSubmissionProps {
  onBack?: () => void;
  selfForm: SelfFormData;
  onActionComplete?: () => void;
}

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const user = session.user;
      setUser(user);
    }
  }, [session]);

  useEffect(() => {
    axios
      .get("/api/division")
      .then((res) => {
        setDivisions(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      axios
        .get(`/api/department?divisionId=${selectedDivision}`)
        .then((res) => {
          setDepartments(res.data);
          setSections([]); // ✅ clear sections when division changes
        })
        .catch(console.error);
    } else {
      setDepartments([]); // ✅ clear both if division cleared
      setSections([]);
    }

    // also clear current selections
    setSelectedDepartment("");
    setSelectedSection("");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(`/api/section?departmentId=${selectedDepartment}`)
        .then((res) => {
          setSections(res.data);
        })
        .catch(console.error);
    } else {
      setSections([]); // ✅ clear sections if no department selected
    }

    // clear selected section every time department changes
    setSelectedSection("");
  }, [selectedDepartment]);

  useEffect(() => {
    if (user) {
      findUser();
    }
  }, [user]);

  const findUser = async () => {
    await axios
      .get(`/api/user/${user?.staffid}`)
      .then((res) => {
        const data = res.data.data;
        setUserSession(data);
        console.log("res user: ", data);
      })
      .catch(console.error);
  };

  const nextApproval = selfForm.approvals?.find(
    (a: { approverId: number; status: string }) => a.status === "PENDING"
  );

  const isFormCompleted =
    selfForm.status === "APPROVED" || selfForm.status === "REJECTED";

  const canApprove =
    !isFormCompleted && nextApproval?.approverId === userSession?.id;

  const handleActionClick = (type: "approve" | "reject") => {
    setActionType(type);
    setConfirmModalOpen(true);
  };

  const performApproval = async () => {
    if (!actionType) return;
    const remarks = selfForm.formData;
    setLoading(true);
    try {
      await axios.post("/api/approval-form/action", {
        approvalId: nextApproval?.id,
        action: actionType,
        remarks: getFormRemarks(remarks),
      });
      if (onActionComplete) await onActionComplete();
      if (onBack) await onBack();
      // Optionally refresh data or call a parent callback
    } catch (error) {
      console.error(error);
      alert("Failed to perform action");
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setActionType(null);
    }
  };

  const mappedApprovals: ApprovalUser[] = selfForm.approvals.map(
    (a, index) => ({
      id: a.id,
      submissionId: selfForm.id,
      approverId: a.approverId,
      status: a.status as "PENDING" | "APPROVED" | "REJECTED" | "WAITING",
      stepOrder: index + 1, // or use real stepOrder if available
      remarks: a.remarks || null,
      approvedAt: a.approvedAt || null,
      approver: a.approver
        ? {
            staffid: a.approver.staffid,
            email: a.approver.email,
            name: a.approver.fullname,
          }
        : undefined,
    })
  );

  if (!selfForm) {
    return (
      <p className="text-center text-sm text-gray-500 py-6">
        Loading form data ...
      </p>
    );
  }

  console.log("self form: ", selfForm);

  return (
    <>
      <LoadingScreen show={loading} />
      <div className="bg-white my-6 p-6 rounded-lg border border-gray-300 shadow-xs">
        {/* Header */}
        <div className="mb-4">
          <PrimaryButton
            name="Back to list"
            icon={<IoReturnDownBack className="w-5 h-5" />}
            onClick={onBack}
            className="text-indigo-800 hover:text-indigo-500 text-xs font-medium cursor-pointer"
          />
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {selfForm.formType.name}
            </h1>
            <p className="text-xs text-indigo-800 font-light">
              This form is strictly for reference/viewing.
            </p>
          </div>

          <PrimaryButton
            name="Download PDF"
            onClick={() =>
              downloadFormPDF({
                formData: selfForm.formData,
                departmentName: selfForm.departmentName ?? "",
                divisionName: selfForm.divisionName ?? "",
                sectionName: selfForm.sectionName ?? "",
                createdBy: selfForm.createdBy,
                approvals: mappedApprovals,
              })
            }
            className="bg-purple-700 text-white px-3 py-2 text-xs rounded-sm hover:bg-purple-900 cursor-pointer duration-200 transition-all ease-in-out"
            icon={<MdOutlineFileDownload className="w-5 h-5" />}
          />
        </div>

        <div>
          <ManPowerRequisitionView
            formId={selfForm.id}
            divisions={divisions}
            departments={departments}
            sections={sections}
            setSelectedDivision={setSelectedDivision}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedSection={setSelectedSection}
            setSelectedWorkLocation={setSelectedWorkLocation}
            user={user}
            selfForm={selfForm}
          />

          <div>
            {canApprove && (
              <div className="flex gap-x-4 justify-end">
                <PrimaryButton
                  name="Reject"
                  type="button"
                  onClick={() => handleActionClick("reject")}
                  className="border border-red-600 bg-red-600 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-red-700 hover:border-red-700 ease-in-out duration-200 transition-all"
                />
                <PrimaryButton
                  name="Approve"
                  type="button"
                  onClick={() => handleActionClick("approve")}
                  className="border border-indigo-800 bg-indigo-800 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-indigo-700 hover:border-indigo-700 ease-in-out duration-200 transition-all"
                />
              </div>
            )}
          </div>

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

      {/* ✅ Approval Remarks Section */}
      {/* ✅ Approval Timeline Section */}
      {selfForm.approvals && selfForm.approvals.length > 0 && (
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
            {selfForm.approvals.map((approval, index) => (
              <div key={approval.id} className="relative">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[10px] top-1 w-4 h-4 rounded-full border-2 ${
                    approval.status === "APPROVED"
                      ? "border-green-600 bg-green-100"
                      : approval.status === "REJECTED"
                      ? "border-red-600 bg-red-100"
                      : "border-yellow-500 bg-yellow-100"
                  }`}
                ></div>

                {/* Timeline content */}
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
                      placeholder=""
                    />
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
