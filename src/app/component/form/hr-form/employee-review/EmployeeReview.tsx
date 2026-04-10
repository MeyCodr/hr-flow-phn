import ComboBox from "@/app/component/ui/ComboBox";
import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import { EmployeeReviewTypes } from "@/app/types/types";
import React, { useState } from "react";
import { addDashOption } from "../../../../../../lib/utils";
import { DynamicFormProps } from "../HrFormsClient";
import DatePicker, { DateValueType } from "@/app/component/ui/DatePicker";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import { performanceRatings } from "../../../../../../lib/data";
import { TextArea } from "@/app/component/ui/TextArea";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { withBasePath } from "@/lib/base-path";

export default function EmployeeReview({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  user,
  onSubmitSuccess,
  formId,
  selfForm,
  readOnly = false,
}: DynamicFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;

    const payload = {
      ...data,
      user: user,
      formTypeId: formId,
    };
    const toastId = "";
    try {
      const res = await axios.post(
        withBasePath(`/api/form/employee-review-post`),
        JSON.stringify(payload)
      );
      if (res.status === 200) {
        toast.success("Form submitted successfully!", { toasterId: toastId });
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        toast.error("Failed to submit the form.", { toasterId: toastId });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            error.message ||
            "Something went wrong",
          { toasterId: toastId }
        );
      } else if (error instanceof Error) {
        toast.error(error.message, { toasterId: toastId });
      } else {
        toast.error("An unexpected error occurred", { toasterId: toastId });
      }
    }
  };

  const parsedData: EmployeeReviewTypes = {
    ...(selfForm?.formData as unknown as EmployeeReviewTypes),
    divisionName: selfForm?.divisionName,
    departmentName: selfForm?.departmentName,
    sectionName: selfForm?.sectionName,
  };

  const formData = readOnly && parsedData ? parsedData : data;

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-white max-w-6xl p-4 border border-gray-300 rounded-xl space-y-6">
          <h1 className="text-xl font-semibold">Employee Information</h1>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Employee Name"
                  htmlFor="staffName"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="staffName"
                  name="staffName"
                  type="text"
                  value={data.staffName}
                  onChange={handleChange}
                  placeholder="Employee Name"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Job Title"
                  htmlFor="jobTitle"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={data.jobTitle}
                  onChange={handleChange}
                  placeholder="Job Title"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Division"
                  htmlFor="division"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={divisions}
                  selectedValue={data.divisionName} // ✅ controlled
                  onSelect={(item) => {
                    const value = item ? item.id.toString() : "";
                    setSelectedDivision(value);
                    setSelectedDepartment("");
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      divisionName: value,
                      departmentName: "",
                      sectionName: "",
                    }));
                  }}
                  // disabled={readOnly}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Department"
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={addDashOption(departments)}
                  selectedValue={
                    formData?.departmentName ?? formData.departmentName ?? ""
                  } // ✅ controlled
                  onSelect={(item) => {
                    const value =
                      item && item.name !== "-" ? item.id.toString() : "";
                    setSelectedDepartment(value);
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      departmentName: value,
                      sectionName: "",
                    }));
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Section"
                  htmlFor="section"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={addDashOption(sections)}
                  selectedValue={
                    formData?.sectionName ?? formData.sectionName ?? ""
                  }
                  onSelect={(item) => {
                    const value =
                      item && item.name !== "-" ? item.id.toString() : "";
                    setSelectedSection(value);
                    setData((prev) => ({ ...prev, sectionName: value }));
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Date of Submission"
                  htmlFor="createddate"
                  className="block text-sm font-medium text-gray-900"
                />
                <DatePicker
                  value={readOnly ? parsedData?.dateJoin : data.dateJoin}
                  onChange={readOnly ? () => {} : handleDateChange("dateJoin")}
                  disabled={readOnly}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Employee ID"
                  htmlFor="staffId"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="staffId"
                  name="staffId"
                  type="text"
                  value={data.staffId}
                  onChange={handleChange}
                  placeholder="Staff ID"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Evaluator"
                  htmlFor="evaluator"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="evaluator"
                  name="evaluator"
                  type="text"
                  value={data.evaluator}
                  onChange={handleChange}
                  placeholder="Evaluator"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Review Period From"
                  htmlFor="reviewPeriodFrom"
                  className="block text-sm font-medium text-gray-900"
                />
                <DatePicker
                  value={
                    readOnly
                      ? parsedData?.reviewPeriodFrom
                      : data.reviewPeriodFrom
                  }
                  onChange={
                    readOnly ? () => {} : handleDateChange("reviewPeriodFrom")
                  }
                  disabled={readOnly}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Review Period To"
                  htmlFor="reviewPeriodTo"
                  className="block text-sm font-medium text-gray-900"
                />
                <DatePicker
                  value={
                    readOnly ? parsedData?.reviewPeriodTo : data.reviewPeriodTo
                  }
                  onChange={
                    readOnly ? () => {} : handleDateChange("reviewPeriodTo")
                  }
                  disabled={readOnly}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Month Review"
                  htmlFor="monthReview"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="monthReview"
                  name="monthReview"
                  type="text"
                  value={data.monthReview}
                  onChange={handleChange}
                  placeholder="Month Review"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white max-w-6xl p-4 border border-gray-300 rounded-xl space-y-6 my-6">
          <div>
            <h1 className="text-xl font-semibold">Performance Review</h1>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Job Knowledge"
                  htmlFor="jobKnowledge"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={performanceRatings}
                  selectedValue={data.jobKnowledge}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setData((prev) => ({ ...prev, jobKnowledge: value }));
                  }}
                  disabled={readOnly}
                />
                <TextArea
                  id="jobKnowledgeComments"
                  name="jobKnowledgeComments"
                  value={
                    readOnly
                      ? parsedData.jobKnowledgeComments
                      : data.jobKnowledgeComments
                  }
                  onChange={handleTextAreaChange}
                  disabled={readOnly}
                  placeholder="Comments ..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Work Quality"
                  htmlFor="workQuality"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={performanceRatings}
                  selectedValue={data.workQuality}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setData((prev) => ({ ...prev, workQuality: value }));
                  }}
                  disabled={readOnly}
                />
                <TextArea
                  id="workQualityComments"
                  name="workQualityComments"
                  value={
                    readOnly
                      ? parsedData.workQualityComments
                      : data.workQualityComments
                  }
                  onChange={handleTextAreaChange}
                  disabled={readOnly}
                  placeholder="Comments ..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Attendance & Punctuality"
                  htmlFor="attendancePunctuality"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={performanceRatings}
                  selectedValue={data.attendancePunctuality}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setData((prev) => ({
                      ...prev,
                      attendancePunctuality: value,
                    }));
                  }}
                  disabled={readOnly}
                />
                <TextArea
                  id="attendancePunctualityComments"
                  name="attendancePunctualityComments"
                  value={
                    readOnly
                      ? parsedData.attendancePunctualityComments
                      : data.attendancePunctualityComments
                  }
                  onChange={handleTextAreaChange}
                  disabled={readOnly}
                  placeholder="Comments ..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Communication Skills and Teamwork"
                  htmlFor="communicationSkills"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={performanceRatings}
                  selectedValue={data.communicationSkills}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setData((prev) => ({
                      ...prev,
                      communicationSkills: value,
                    }));
                  }}
                  disabled={readOnly}
                />
                <TextArea
                  id="communicationSkillsComments"
                  name="communicationSkillsComments"
                  value={
                    readOnly
                      ? parsedData.communicationSkillsComments
                      : data.communicationSkillsComments
                  }
                  onChange={handleTextAreaChange}
                  disabled={readOnly}
                  placeholder="Comments ..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Competency in the Role"
                  htmlFor="competencyRoles"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={performanceRatings}
                  selectedValue={data.competencyRoles}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setData((prev) => ({
                      ...prev,
                      competencyRoles: value,
                    }));
                  }}
                  disabled={readOnly}
                />
                <TextArea
                  id="competencyRolesComments"
                  name="competencyRolesComments"
                  value={
                    readOnly
                      ? parsedData.competencyRolesComments
                      : data.competencyRolesComments
                  }
                  onChange={handleTextAreaChange}
                  disabled={readOnly}
                  placeholder="Comments ..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div></div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Average Rating/Score"
                  htmlFor="averageRating"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="averageRating"
                  name="averageRating"
                  type="text"
                  value={data.averageRating}
                  onChange={handleChange}
                  placeholder="Average Rating/Score"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white max-w-6xl p-4 border border-gray-300 rounded-xl space-y-6">
          <h1 className="text-xl font-semibold">Acknowledgment</h1>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                name="Superior Signature"
                htmlFor="superiorSignature"
                className="block text-sm font-medium text-gray-900"
              />
              <Input
                id="superiorSignature"
                name="superiorSignature"
                type="text"
                value={data.superiorSignature}
                onChange={handleChange}
                placeholder="Superior Signature"
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <DatePicker
                value={readOnly ? parsedData?.superiorDate : data.superiorDate}
                onChange={
                  readOnly ? () => {} : handleDateChange("superiorDate")
                }
                disabled={readOnly}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="HOD Signature"
                htmlFor="hodSignature"
                className="block text-sm font-medium text-gray-900"
              />
              <Input
                id="hodSignature"
                name="hodSignature"
                type="text"
                value={data.hodSignature}
                onChange={handleChange}
                placeholder="Superior Signature"
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <DatePicker
                value={readOnly ? parsedData?.hodDate : data.hodDate}
                onChange={readOnly ? () => {} : handleDateChange("hodDate")}
                disabled={readOnly}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2 col-span-2">
              <Label
                name="Epmloyee Comments and Goals"
                htmlFor="competencyRoles"
                className="block text-sm font-medium text-gray-900"
              />
              <TextArea
                id="competencyRolesComments"
                name="competencyRolesComments"
                value={
                  readOnly
                    ? parsedData.competencyRolesComments
                    : data.competencyRolesComments
                }
                onChange={handleTextAreaChange}
                disabled={readOnly}
                placeholder="(By signing this form, you confirm that you have discussed this review in detail with your superior and acknowledged on the comments and advices for improvements where necessary.)"
                rows={6}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="Employee Signature"
                htmlFor="employeeSignature"
                className="block text-sm font-medium text-gray-900"
              />
              <Input
                id="employeeSignature"
                name="employeeSignature"
                type="text"
                value={data.employeeSignature}
                onChange={handleChange}
                placeholder="Superior Signature"
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <DatePicker
                value={readOnly ? parsedData?.employeeDate : data.employeeDate}
                onChange={
                  readOnly ? () => {} : handleDateChange("employeeDate")
                }
                disabled={readOnly}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="HCD Acknowledgement"
                htmlFor="hcdAcknowledgement"
                className="block text-sm font-medium text-gray-900"
              />
              <Input
                id="hcdAcknowledgement"
                name="hcdAcknowledgement"
                type="text"
                value={data.hcdAcknowledgement}
                onChange={handleChange}
                placeholder="Superior Signature"
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <DatePicker
                value={readOnly ? parsedData?.hcdDate : data.hcdDate}
                onChange={readOnly ? () => {} : handleDateChange("hcdDate")}
                disabled={readOnly}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          {!readOnly ? (
            <PrimaryButton
              name="Submit"
              type="submit"
              disabled={readOnly}
              className={`border px-10  py-2 text-white rounded-md  transition-all ease-in-out duration-150   text-xs text-center ${
                readOnly
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-800 hover:bg-indigo-700 cursor-pointer"
              }`}
            />
          ) : (
            <></>
          )}
        </div>
      </form>
    </>
  );
}
