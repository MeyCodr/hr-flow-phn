"use client";

import ComboBox from "@/app/component/ui/ComboBox";
import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import { EmployeeReviewTypes } from "@/app/types/types";
import React, { useEffect, useState } from "react";
import { addDashOption } from "../../../../../../lib/utils";
import { DynamicFormProps } from "../HrFormsClient";
import DatePicker, { DateValueType } from "@/app/component/ui/DatePicker";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import { TextArea } from "@/app/component/ui/TextArea";
import CheckBox from "@/app/component/ui/CheckBox";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { withBasePath } from "@/lib/base-path";
import LoadingScreen from "@/app/component/ui/LoadingScreen";
import { useRouter } from "next/navigation";

type RatingField =
  | "jobKnowledge"
  | "workQuality"
  | "attendancePunctuality"
  | "communicationSkills"
  | "competencyRoles";

type CommentField =
  | "jobKnowledgeComments"
  | "workQualityComments"
  | "attendancePunctualityComments"
  | "communicationSkillsComments"
  | "competencyRolesComments";

const RATING_LABELS = [
  "1 = Poor",
  "2 = Fair",
  "3 = Satisfactory",
  "4 = Good",
  "5 = Excellent",
];

const RATING_FIELDS: RatingField[] = [
  "jobKnowledge",
  "workQuality",
  "attendancePunctuality",
  "communicationSkills",
  "competencyRoles",
];

const PERFORMANCE_CRITERIA: {
  label: string;
  field: RatingField;
  commentField: CommentField;
}[] = [
    {
      label: "Job Knowledge",
      field: "jobKnowledge",
      commentField: "jobKnowledgeComments",
    },
    {
      label: "Work Quality",
      field: "workQuality",
      commentField: "workQualityComments",
    },
    {
      label: "Attendance / Punctuality",
      field: "attendancePunctuality",
      commentField: "attendancePunctualityComments",
    },
    {
      label: "Communication Skills and Team Work",
      field: "communicationSkills",
      commentField: "communicationSkillsComments",
    },
    {
      label: "Competency in the Role",
      field: "competencyRoles",
      commentField: "competencyRolesComments",
    },
  ];

const REVIEW_MONTHS = ["1", "2", "3", "4", "5"];

const INPUT_CLASS =
  "w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500";

const LABEL_CLASS = "block text-sm font-medium text-gray-900";

export default function EmployeeReview({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setSelectedWorkLocation: _setSelectedWorkLocation,
  user,
  onSubmitSuccess,
  formId,
  selfForm,
  readOnly = false,
  fillInMode = false,
}: DynamicFormProps) {
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<{
    id: number;
    name: string;
    staffid: string;
    designation: string;
    divisionId: number | null;
    divisionName: string;
    departmentId: number | null;
    departmentName: string;
    sectionId: number | null;
    sectionName: string;
  }[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios.get(withBasePath("/api/user")).then((res) => {
      setUserList(
        res.data.map((u: {
          id: number;
          fullname: string;
          staffid: string;
          designation: string | null;
          divisionId: number | null;
          division: { name: string } | null;
          departmentId: number | null;
          department: { name: string } | null;
          sectionId: number | null;
          section: { name: string } | null;
        }) => ({
          id: u.id,
          name: u.fullname,
          staffid: u.staffid,
          designation: u.designation ?? "",
          divisionId: u.divisionId,
          divisionName: u.division?.name ?? "",
          departmentId: u.departmentId,
          departmentName: u.department?.name ?? "",
          sectionId: u.sectionId,
          sectionName: u.section?.name ?? "",
        }))
      );
    });
  }, []);

  const [data, setData] = useState<EmployeeReviewTypes>({
    staffName: "",
    jobTitle: "",
    divisionName: "",
    departmentName: "",
    sectionName: "",
    reviewPeriodFrom: "",
    reviewPeriodTo: "",
    staffId: "",
    dateJoin: "",
    evaluator: "",
    monthReview: "",
    jobKnowledge: "",
    jobKnowledgeComments: "",
    workQuality: "",
    workQualityComments: "",
    attendancePunctuality: "",
    attendancePunctualityComments: "",
    communicationSkills: "",
    communicationSkillsComments: "",
    competencyRoles: "",
    competencyRolesComments: "",
    averageRating: "",
    superiorSignature: "",
    superiorDate: "",
    hodSignature: "",
    hodDate: "",
    employeeComments: "",
    employeeSignature: "",
    employeeDate: "",
    hcdAcknowledgement: "",
    hcdDate: "",
  });

  useEffect(() => {
    if (readOnly || !user?.name) return;
    setData((prev) => ({ ...prev, evaluator: user.name }));
  }, [user, readOnly]);

  // In fill-in mode seed employeeComments from saved data so the textarea isn't blank
  useEffect(() => {
    if (!fillInMode || !selfForm?.formData) return;
    const saved = selfForm.formData as unknown as EmployeeReviewTypes;
    setData((prev) => ({ ...prev, employeeComments: saved.employeeComments ?? "" }));
  }, [fillInMode, selfForm?.formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange =
    (field: keyof typeof data) => (val: DateValueType) => {
      setData((prev) => ({ ...prev, [field]: val }));
    };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingSelect = (field: RatingField, rating: string) => {
    if (readOnly || fillInMode) return;
    setData((prev) => {
      const newRating = prev[field] === rating ? "" : rating;
      const updated = { ...prev, [field]: newRating };
      const total = RATING_FIELDS.reduce((sum, f) => {
        const v = f === field ? newRating : prev[f];
        return sum + (v ? parseInt(v) : 0);
      }, 0);
      return { ...updated, averageRating: total > 0 ? total.toString() : "" };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;

    setLoading(true);
    const toastId = "";

    try {
      if (fillInMode) {
        if (!data.employeeComments.trim()) {
          toast.error("Employee Comments and Goals is required.");
          setLoading(false);
          return;
        }
        // Employee submitting their comments (formId = formSubmission.id here)
        await axios.post(
          withBasePath(`/api/form/employee-review-employee-submit`),
          JSON.stringify({ formSubmissionId: formId, user, employeeComments: data.employeeComments })
        );
        toast.success("Comments submitted successfully!", { toasterId: toastId });
        setTimeout(() => {
          router.replace("/dashboard/approval");
          onSubmitSuccess?.();
        }, 1200);
        return;
      }

      // Initial submission — auto-populate superior signature & date
      const today = new Date().toISOString().split("T")[0];
      const res = await axios.post(
        withBasePath(`/api/form/employee-review-post`),
        JSON.stringify({
          ...data,
          superiorSignature: user?.name ?? "",
          superiorDate: today,
          reviewStage: "EVALUATOR_SUBMITTED",
          user,
          formTypeId: formId,
        })
      );
      if (res.status === 200) {
        toast.success("Form submitted successfully!", { toasterId: toastId });
        setTimeout(() => {
          router.replace("/dashboard/forms");
          onSubmitSuccess?.();
        }, 1200);
      } else {
        toast.error("Failed to submit the form.", { toasterId: toastId });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || error.message || "Something went wrong",
          { toasterId: toastId }
        );
      } else if (error instanceof Error) {
        toast.error(error.message, { toasterId: toastId });
      } else {
        toast.error("An unexpected error occurred", { toasterId: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const savedFormData = selfForm?.formData as unknown as EmployeeReviewTypes;
  const parsedData: EmployeeReviewTypes = {
    ...savedFormData,
    divisionName: selfForm?.divisionName ?? savedFormData?.divisionName,
    departmentName: selfForm?.departmentName ?? savedFormData?.departmentName,
    sectionName: selfForm?.sectionName ?? savedFormData?.sectionName,
  };

  // In fill-in mode use parsedData for display; only employeeComments comes from local state
  const formData = (readOnly || fillInMode) && parsedData ? parsedData : data;

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <LoadingScreen show={loading} />

      <form
        onSubmit={handleSubmit}
        className={`bg-white max-w-6xl rounded-xl ${readOnly ? "p-0" : "p-4"
          }`}
      >
        {/* Form header */}
        <div>
          <h1 className="text-xl font-semibold">
            {readOnly ? "" : fillInMode ? "" : "Employee Monthly Performance Review"}
          </h1>
          <p className="text-sm text-indigo-800">
            {readOnly ? "" : fillInMode
              ? "Your performance review is complete. Please fill in your comments below."
              : "Fill in the employee performance details below"}
          </p>
        </div>

        {/* ── Employee Information ── */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-indigo-800 mb-4">
            Employee Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Employee Name"
                  htmlFor="staffName"
                  className={LABEL_CLASS}
                />
                <ComboBox
                  menu={userList}
                  selectedValue={formData.staffName}
                  onSelect={(item) => {
                    const selected = userList.find((u) => u.id === item?.id);
                    if (!selected) return;
                    if (selected.divisionId) setSelectedDivision(selected.divisionId.toString());
                    if (selected.departmentId) setSelectedDepartment(selected.departmentId.toString());
                    if (selected.sectionId) setSelectedSection(selected.sectionId.toString());
                    setData((prev) => ({
                      ...prev,
                      staffName: selected.name,
                      staffId: selected.staffid,
                      jobTitle: selected.designation,
                      divisionName: selected.divisionName,
                      departmentName: selected.departmentName,
                      sectionName: selected.sectionName,
                    }));
                  }}
                  disabled={readOnly || fillInMode}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Job Title"
                  htmlFor="jobTitle"
                  className={LABEL_CLASS}
                />
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={readOnly || fillInMode ? () => { } : handleChange}
                  disabled={readOnly || fillInMode}
                  placeholder="Job Title"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Division"
                  htmlFor="division"
                  className={LABEL_CLASS}
                />
                <ComboBox
                  menu={divisions}
                  selectedValue={formData.divisionName ?? ""}
                  onSelect={(item) => {
                    const id = item ? item.id.toString() : "";
                    const name = item ? item.name : "";
                    setSelectedDivision(id);
                    setSelectedDepartment("");
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      divisionName: name,
                      departmentName: "",
                      sectionName: "",
                    }));
                  }}
                  disabled={readOnly || fillInMode}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Department"
                  htmlFor="department"
                  className={LABEL_CLASS}
                />
                <ComboBox
                  menu={addDashOption(departments)}
                  selectedValue={formData.departmentName ?? ""}
                  onSelect={(item) => {
                    const id =
                      item && item.name !== "-" ? item.id.toString() : "";
                    const name =
                      item && item.name !== "-" ? item.name : "";
                    setSelectedDepartment(id);
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      departmentName: name,
                      sectionName: "",
                    }));
                  }}
                  disabled={readOnly || fillInMode}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Section"
                  htmlFor="section"
                  className={LABEL_CLASS}
                />
                <ComboBox
                  menu={addDashOption(sections)}
                  selectedValue={formData.sectionName ?? ""}
                  onSelect={(item) => {
                    const id =
                      item && item.name !== "-" ? item.id.toString() : "";
                    const name =
                      item && item.name !== "-" ? item.name : "";
                    setSelectedSection(id);
                    setData((prev) => ({ ...prev, sectionName: name }));
                  }}
                  disabled={readOnly || fillInMode}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Staff ID"
                  htmlFor="staffId"
                  className={LABEL_CLASS}
                />
                <Input
                  id="staffId"
                  name="staffId"
                  type="text"
                  value={formData.staffId}
                  onChange={readOnly || fillInMode ? () => { } : handleChange}
                  disabled={readOnly || fillInMode}
                  placeholder="Employee ID"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Date Join"
                  htmlFor="dateJoin"
                  className={LABEL_CLASS}
                />
                <DatePicker
                  value={formData.dateJoin}
                  onChange={readOnly || fillInMode ? () => {} : handleDateChange("dateJoin")}
                  disabled={readOnly || fillInMode}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Evaluator"
                  htmlFor="evaluator"
                  className={LABEL_CLASS}
                />
                <Input
                  id="evaluator"
                  name="evaluator"
                  type="text"
                  value={formData.evaluator}
                  onChange={() => { }}
                  disabled
                  placeholder="Evaluator"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Review Period"
                  htmlFor="reviewPeriodFrom"
                  className={LABEL_CLASS}
                />
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={formData.reviewPeriodFrom}
                    onChange={
                      readOnly || fillInMode ? () => {} : handleDateChange("reviewPeriodFrom")
                    }
                    disabled={readOnly || fillInMode}
                    className={INPUT_CLASS}
                  />
                  <span className="text-gray-400 text-xs shrink-0">to</span>
                  <DatePicker
                    value={formData.reviewPeriodTo}
                    onChange={
                      readOnly || fillInMode ? () => {} : handleDateChange("reviewPeriodTo")
                    }
                    disabled={readOnly || fillInMode}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Label
                  name="Month"
                  htmlFor="monthReview"
                  className={LABEL_CLASS}
                />
                <div className="flex items-center gap-x-4">
                  {REVIEW_MONTHS.map((month) => (
                    <div
                      key={month}
                      className="flex items-center gap-x-2 cursor-pointer"
                      onClick={() =>
                        !readOnly && !fillInMode &&
                        setData((prev) => ({
                          ...prev,
                          monthReview:
                            prev.monthReview === month ? "" : month,
                        }))
                      }
                    >
                      <CheckBox
                        checked={formData.monthReview === month}
                        disabled={readOnly || fillInMode}
                      />
                      <Label
                        name={month}
                        htmlFor=""
                        className="block text-sm font-medium text-gray-900 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  (please tick the review month)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full border border-indigo-800/60 my-6" />

        {/* ── Performance Review ── */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-800 mb-4">
            Performance Review
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-6 font-medium text-gray-500 w-2/5" />
                  {RATING_LABELS.map((label) => (
                    <th
                      key={label}
                      className="text-center py-2 px-3 font-medium text-gray-700 whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE_CRITERIA.map((criterion, idx) => (
                  <React.Fragment key={criterion.field}>
                    <tr
                      className={`border-t ${idx === 0 ? "border-gray-200" : "border-gray-100"
                        }`}
                    >
                      <td className="py-3 pr-6 font-medium text-gray-900">
                        {criterion.label}
                      </td>
                      {["1", "2", "3", "4", "5"].map((rating) => (
                        <td key={rating} className="text-center py-3 px-3">
                          <div
                            className="flex justify-center cursor-pointer"
                            onClick={() =>
                              handleRatingSelect(criterion.field, rating)
                            }
                          >
                            <CheckBox
                              checked={formData[criterion.field] === rating}
                              disabled={readOnly || fillInMode}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td colSpan={6} className="pb-4 pt-1 pr-2">
                        <TextArea
                          id={criterion.commentField}
                          name={criterion.commentField}
                          value={formData[criterion.commentField]}
                          onChange={readOnly || fillInMode ? () => {} : handleTextAreaChange}
                          disabled={readOnly || fillInMode}
                          placeholder="Comments"
                          rows={2}
                          className={INPUT_CLASS}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full border border-indigo-800/20 my-4" />

          <div className="flex items-center gap-x-4">
            <Label
              name="Average Rating / Score:"
              htmlFor="averageRating"
              className="text-sm font-medium text-gray-900"
            />
            <div className="flex items-center gap-x-2">
              <Input
                id="averageRating"
                name="averageRating"
                type="text"
                value={formData.averageRating}
                onChange={readOnly ? () => { } : handleChange}
                disabled
                placeholder="—"
                className="w-20 border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500 font-medium leading-none">/25</span>
            </div>
          </div>
        </div>

        <div className="w-full border border-indigo-800/60 my-6" />

        {/* ── Signatures ── */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-800 mb-4">
            Acknowledgment
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                name="Superior Signature"
                htmlFor="superiorSignature"
                className={LABEL_CLASS}
              />
              <Input
                id="superiorSignature"
                name="superiorSignature"
                type="text"
                value={formData.superiorSignature}
                onChange={() => { }}
                disabled
                placeholder="Superior Signature"
                className={INPUT_CLASS}
              />
              <Label name="Date" htmlFor="superiorDate" className={LABEL_CLASS} />
              <DatePicker
                value={formData.superiorDate}
                onChange={() => { }}
                disabled
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="HOD Signature"
                htmlFor="hodSignature"
                className={LABEL_CLASS}
              />
              <Input
                id="hodSignature"
                name="hodSignature"
                type="text"
                value={formData.hodSignature}
                onChange={() => { }}
                disabled
                placeholder="HOD Signature"
                className={INPUT_CLASS}
              />
              <Label name="Date" htmlFor="hodDate" className={LABEL_CLASS} />
              <DatePicker
                value={formData.hodDate}
                onChange={() => { }}
                disabled
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="w-full border border-indigo-800/60 my-6" />

        {/* ── Employee Comments and Goals ── */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-800 mb-1">
            Employee Comments and Goals
            {fillInMode && <span className="text-red-500 ml-1">*</span>}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            (By signing this form, you confirm that you have discussed this
            review in detail with your superior and acknowledged on the comments
            and advices for improvements where necessary.)
          </p>

          <TextArea
            id="employeeComments"
            name="employeeComments"
            value={fillInMode ? data.employeeComments : formData.employeeComments}
            onChange={readOnly ? () => { } : handleTextAreaChange}
            disabled={readOnly || !fillInMode}
            placeholder="Employee comments and goals..."
            rows={4}
            className={INPUT_CLASS}
          />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="flex flex-col space-y-2">
              <Label
                name="Employee Signature"
                htmlFor="employeeSignature"
                className={LABEL_CLASS}
              />
              <Input
                id="employeeSignature"
                name="employeeSignature"
                type="text"
                value={formData.employeeSignature}
                onChange={() => { }}
                disabled
                placeholder="Employee Signature"
                className={INPUT_CLASS}
              />
              <Label
                name="Date"
                htmlFor="employeeDate"
                className={LABEL_CLASS}
              />
              <DatePicker
                value={formData.employeeDate}
                onChange={() => { }}
                disabled
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="HCD Acknowledgement"
                htmlFor="hcdAcknowledgement"
                className={LABEL_CLASS}
              />
              <Input
                id="hcdAcknowledgement"
                name="hcdAcknowledgement"
                type="text"
                value={formData.hcdAcknowledgement}
                onChange={() => { }}
                disabled
                placeholder="HCD Acknowledgement"
                className={INPUT_CLASS}
              />
              <Label name="Date" htmlFor="hcdDate" className={LABEL_CLASS} />
              <DatePicker
                value={formData.hcdDate}
                onChange={() => { }}
                disabled
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          {!readOnly ? (
            <PrimaryButton
              name={fillInMode ? "Submit Comments" : "Submit"}
              type="submit"
              disabled={false}
              className="border px-10 py-2 text-white rounded-md transition-all ease-in-out duration-150 text-xs text-center bg-indigo-800 hover:bg-indigo-700 cursor-pointer"
            />
          ) : (
            <></>
          )}
        </div>
      </form>
    </>
  );
}