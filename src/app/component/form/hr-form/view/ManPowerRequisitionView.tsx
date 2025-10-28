"use client";

import React, { useEffect, useState } from "react";

import { ManPowerTypes, UserInfo } from "@/app/types/types";

import axios from "axios";
import { DynamicFormProps } from "../HrFormsClient";
import Dropdown from "@/app/component/ui/Dropdown";
import { categoryManPower, workLocation } from "../../../../../../lib/data";
import Label from "@/app/component/ui/Label";
import DatePicker, { DateValueType } from "@/app/component/ui/DatePicker";
import ComboBox from "@/app/component/ui/ComboBox";
import { Input } from "@/app/component/ui/Input";
import CheckBox from "@/app/component/ui/CheckBox";
import { TextArea } from "@/app/component/ui/TextArea";
import { SelfFormData } from "@/app/component/approval/submissionComponent/ViewSubmission";

interface ManPowerRequisitionViewProps extends DynamicFormProps {
  selfForm: SelfFormData;
}

export default function ManPowerRequisitionView({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setSelectedWorkLocation,
  user,
  selfForm,
}: ManPowerRequisitionViewProps) {
  const [data, setData] = useState<ManPowerTypes>({
    category: null,
    createddate: null,
    lastWorkingDay: null,
    dateRequested: null,
    dateRecommended: null,
    dateReviewed: null,
    dateVerified: null,
    dateApproved: null,
    division: "",
    department: "",
    section: "",
    designation: "",
    reportingTo: "",
    noRequested: "",
    currentHeadCount: "",
    approvedRequirement: "",
    workLocation: "",
    workStation: "",
    employmentType: "",
    manpowerPlan: "",
    approvedAmp: "",
    keyRequirement: "",
    keyResponsibilities: "",
    reasonOfRequisition: "",
    selectedOption: "",
    incumbentName: "",
    productionVolumeIncrease: "",
    newProject: "",
    machineFaulty: "",
    other: "",
    requestedBy: "",
    recommendedBy: "",
    reviewedBy: "",
    verifiedBy: "",
    approvedby: "",
    fileAttachment: null,
    remarks: "",
  });
  const [errors, setErrors] = useState<{ category?: string }>({});
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    const staffid = user.staffid;
    console.log("staffid: ", staffid);

    if (!staffid) {
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/user/${staffid}`);
        console.log("res: ", res.data.data);
        const userInfo = res.data.data;
        setUserInfo(userInfo);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching user:", error.message);
        } else {
          console.error("Unknown error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (selfForm.attachments && selfForm.attachments.length > 0) {
      const attachment = selfForm.attachments[0];
      setFile({
        name: attachment.fileName,
        // just a dummy File-like object for display purposes
        size: 0,
        type: attachment.fileType,
        lastModified: new Date(attachment.uploadedAt).getTime(),
      } as File);
    }
  }, [selfForm.attachments]);

  useEffect(() => {
    if (!userInfo) return;

    setData((prev) => ({
      ...prev,
      division: userInfo.divisionId ? userInfo.divisionId.toString() : "",
      department: userInfo.departmentId ? userInfo.departmentId.toString() : "",
      section: userInfo.sectionId ? userInfo.sectionId.toString() : "",
      workLocation: userInfo.workLocation
        ? userInfo.workLocation.toString()
        : "",
    }));

    if (userInfo.divisionId)
      setSelectedDivision(userInfo.divisionId.toString());
    if (userInfo.departmentId)
      setSelectedDepartment(userInfo.departmentId.toString());
    if (userInfo.sectionId) setSelectedSection(userInfo.sectionId.toString());
    if (userInfo.workLocation)
      setSelectedWorkLocation(userInfo.workLocation.toString());
  }, [
    userInfo,
    setSelectedDivision,
    setSelectedDepartment,
    setSelectedSection,
    setSelectedWorkLocation,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange =
    (field: keyof typeof data) => (val: DateValueType) => {
      setData((prev) => ({ ...prev, [field]: val }));
    };

  const addDashOption = (menu: { id: number; name: string }[]) => {
    if (!menu.some((item) => item.name === "-")) {
      return [{ id: 0, name: "-" }, ...menu];
    }
    return menu;
  };

  return (
    <>
      <form action="" className="bg-white max-w-6xl p-4 ">
        <div className="grid grid-cols-1 gap-6 my-10 md:my-0">
          <div className="flex justify-end">
            <div className="flex flex-col">
              <Dropdown
                title="Category"
                menu={categoryManPower}
                className={`w-40 ${
                  errors.category ? "border border-red-500 rounded-md" : ""
                }`}
                selected={selfForm.formData.category?.name}
                onSelect={(item) => {
                  setData((prev) => ({ ...prev, category: item }));
                  setErrors((prev) => ({ ...prev, category: undefined })); // clear error
                }}
                disabled
              />
              {errors.category && (
                <p className="text-xs text-red-600 mt-1">{errors.category}</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  name="Date of Submission"
                  htmlFor="createddate"
                  className="block text-sm font-medium text-gray-900"
                />
                <DatePicker
                  value={selfForm.formData.createddate}
                  onChange={handleDateChange("createddate")}
                  disabled
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
                  disabled
                  selectedValue={selfForm.formData.division} // ✅ controlled
                  onSelect={(item) => {
                    const value = item ? item.id.toString() : "";
                    setSelectedDivision(value);
                    setSelectedDepartment("");
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      division: value,
                      department: "",
                      section: "",
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Department"
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  disabled
                  menu={addDashOption(departments)}
                  selectedValue={selfForm.formData.department}
                  onSelect={(item) => {
                    const value =
                      item && item.name !== "-" ? item.id.toString() : "";
                    setSelectedDepartment(value);
                    setSelectedSection("");
                    setData((prev) => ({
                      ...prev,
                      department: value,
                      section: "",
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Section"
                  htmlFor="section"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  disabled
                  menu={addDashOption(sections)}
                  selectedValue={selfForm.formData.section}
                  onSelect={(item) => {
                    const value =
                      item && item.name !== "-" ? item.id.toString() : "";
                    setSelectedSection(value);
                    setData((prev) => ({ ...prev, section: value }));
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Reporting To"
                  htmlFor="reportingTo"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="reportingTo"
                  name="reportingTo"
                  type="text"
                  value={selfForm.formData.reportingTo}
                  onChange={handleChange}
                  placeholder="Reporting To"
                  required
                  disabled
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="No Requested"
                  htmlFor="noRequested"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="noRequested"
                  name="noRequested"
                  type="text"
                  value={selfForm.formData.noRequested}
                  onChange={handleChange}
                  placeholder="No Requested"
                  required
                  disabled
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex flex-col space-y-2">
                  <Label
                    name="Current Headcount"
                    htmlFor="currentHeadCount"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="currentHeadCount"
                    name="currentHeadCount"
                    type="text"
                    value={selfForm.formData.currentHeadCount}
                    onChange={handleChange}
                    placeholder="Current Headcount"
                    required
                    disabled
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-gray-500 mt-6">/</span>{" "}
                {/* The slash in the middle */}
                <div className="flex-1 flex flex-col space-y-2">
                  <Label
                    name="Approved Requirement"
                    htmlFor="approvedRequirement"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="approvedRequirement"
                    name="approvedRequirement"
                    type="text"
                    value={selfForm.formData.approvedRequirement}
                    onChange={handleChange}
                    placeholder="Approved Requirement"
                    required
                    disabled
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Work Location"
                  htmlFor="workLocation"
                  className="block text-sm font-medium text-gray-900"
                />
                <ComboBox
                  menu={workLocation}
                  selectedValue={selfForm.formData.workLocation}
                  onSelect={(item) => {
                    const value = item ? item.name : "";
                    setSelectedWorkLocation(value);
                    setData((prev) => ({ ...prev, workLocation: value }));
                  }}
                  disabled
                />
              </div>
              <div className="flex flex-col space-y-4 my-1">
                <Label
                  name="Workstation Availability"
                  htmlFor=""
                  className="block text-sm font-medium text-gray-900"
                />
                <div className="flex items-center gap-x-4">
                  <div className="flex items-center gap-x-2">
                    <CheckBox
                      checked={selfForm.formData.workStation === "Yes"}
                      onChange={() =>
                        setData((prev) => ({
                          ...prev,
                          workStation: prev.workStation === "Yes" ? "" : "Yes",
                        }))
                      }
                    />
                    <Label
                      name="Yes"
                      htmlFor=""
                      className="block text-sm font-medium text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <CheckBox
                      checked={selfForm.formData.workStation === "No"}
                      onChange={() =>
                        setData((prev) => ({
                          ...prev,
                          workStation: prev.workStation === "No" ? "" : "No",
                        }))
                      }
                    />
                    <Label
                      name="No"
                      htmlFor=""
                      className="block text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3 my-1">
                <Label
                  name="Employment Type"
                  htmlFor=""
                  className="block text-sm font-medium text-gray-900"
                />
                <div className="flex items-center gap-x-4">
                  <div className="flex items-center gap-x-2">
                    <CheckBox
                      checked={selfForm.formData.employmentType === "Permanent"}
                      onChange={() =>
                        setData((prev) => ({
                          ...prev,
                          employmentType:
                            prev.employmentType === "Permanent"
                              ? ""
                              : "Permanent",
                        }))
                      }
                    />
                    <Label
                      name="Permanent"
                      htmlFor=""
                      className="block text-sm font-medium text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <CheckBox
                      checked={selfForm.formData.employmentType === "Contract"}
                      onChange={() =>
                        setData((prev) => ({
                          ...prev,
                          employmentType:
                            prev.employmentType === "Contract"
                              ? ""
                              : "Contract",
                        }))
                      }
                    />
                    <Label
                      name="Contract"
                      htmlFor=""
                      className="block text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Approved AMP"
                  htmlFor="approvedAmp"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="approvedAmp"
                  name="approvedAmp"
                  type="text"
                  value={selfForm.formData.approvedAmp}
                  onChange={handleChange}
                  placeholder="Approved AMP"
                  required
                  disabled
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="w-full border border-indigo-800/60 my-2"></div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex-1 flex flex-col space-y-2">
              <Label
                name="Key Requirements"
                htmlFor="keyRequirement"
                className="block text-sm font-medium text-gray-900"
              />
              <TextArea
                id="keyRequirement"
                name="keyRequirement"
                value={selfForm.formData.keyRequirement}
                onChange={handleTextAreaChange}
                placeholder="Key Requirement"
                disabled
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 flex flex-col space-y-2">
              <Label
                name="Key Responsibility"
                htmlFor="keyResponsibilities"
                className="block text-sm font-medium text-gray-900"
              />
              <TextArea
                id="keyRequirement"
                name="keyResponsibilities"
                value={selfForm.formData.keyResponsibilities}
                onChange={handleTextAreaChange}
                placeholder="Key Responsibilities"
                disabled
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 flex flex-col space-y-2">
              <Label
                name="Reason of Requisition"
                htmlFor="reasonOfRequisition"
                className="block text-sm font-medium text-gray-900"
              />

              <div className="grid grid-cols-2 gap-6 my-4 border-2 p-4 rounded-lg shadow-lg border-indigo-800/60">
                <div>
                  <div className="flex flex-col ">
                    <div className="flex items-center gap-x-2">
                      <CheckBox
                        checked={
                          selfForm.formData.selectedOption === "replacement"
                        }
                        onChange={() =>
                          setData((prev) => ({
                            ...prev,
                            selectedOption:
                              prev.selectedOption === "replacement"
                                ? ""
                                : "replacement",
                            // reset dependent fields if unselected
                            incumbentName:
                              prev.selectedOption === "replacement"
                                ? ""
                                : prev.incumbentName,
                            lastWorkingDay:
                              prev.selectedOption === "replacement"
                                ? null
                                : prev.lastWorkingDay,
                          }))
                        }
                      />
                      <Label
                        name="Replacement"
                        htmlFor="replacement"
                        className="block text-sm font-medium text-gray-900"
                      />
                    </div>

                    <p className="text-xs ml-8">
                      (Please provide copy of resignation details for
                      replacement hiring)
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 my-6">
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="Incumbent Name"
                        htmlFor="incumbentName"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <Input
                        id="incumbentName"
                        name="incumbentName"
                        type="text"
                        value={selfForm.formData.incumbentName}
                        onChange={handleChange}
                        placeholder="Incumbent Name"
                        required
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="Last Working Day"
                        htmlFor="lastWorkingDay"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <DatePicker
                        value={selfForm.formData.lastWorkingDay}
                        onChange={handleDateChange("lastWorkingDay")}
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col ">
                  <div className="flex items-center gap-x-2">
                    <CheckBox
                      checked={
                        selfForm.formData.selectedOption === "additional"
                      }
                      onChange={() =>
                        setData((prev) => ({
                          ...prev,
                          selectedOption:
                            prev.selectedOption === "additional"
                              ? ""
                              : "additional",
                        }))
                      }
                    />
                    <Label
                      name="Additional"
                      htmlFor="additional"
                      className="block text-sm font-medium text-gray-900"
                    />
                  </div>

                  <p className="text-xs ml-8">
                    (Please provide justification for additional manpower
                    request)
                  </p>

                  <div className="flex flex-col gap-6 my-6">
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="Production Volume Increase (Item)"
                        htmlFor="productionVolumeIncrease"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <Input
                        id="productionVolumeIncrease"
                        name="productionVolumeIncrease"
                        type="text"
                        value={selfForm.formData.productionVolumeIncrease}
                        onChange={handleChange}
                        placeholder="Production Volume Increase (Item)"
                        required
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="New Project"
                        htmlFor="newProject"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <Input
                        id="newProject"
                        name="newProject"
                        type="text"
                        value={selfForm.formData.newProject}
                        onChange={handleChange}
                        placeholder="New Project"
                        required
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="Machine Faulty"
                        htmlFor="machineFaulty"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <Input
                        id="machineFaulty"
                        name="machineFaulty"
                        type="text"
                        value={selfForm.formData.machineFaulty}
                        onChange={handleChange}
                        placeholder="Machine Faulty"
                        required
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col space-y-2">
                      <Label
                        name="Other"
                        htmlFor="other"
                        className="block text-sm font-medium text-gray-900"
                      />
                      <Input
                        id="other"
                        name="other"
                        type="text"
                        value={selfForm.formData.other}
                        onChange={handleChange}
                        placeholder="Other"
                        required
                        disabled
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col space-y-2 mt-4 mb-6">
                <Label
                  name="File Attachment"
                  htmlFor="fileAttachment"
                  className="block text-sm font-medium text-gray-700"
                />

                <label
                  htmlFor="fileAttachment"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-xs text-gray-600  transition hover:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800"
                >
                  <span className="truncate">
                    {file ? file.name : "Choose a file or drag & drop"}
                  </span>
                  <span className="ml-2 rounded bg-indigo-800 px-3 py-1 text-xs font-medium text-white">
                    Browse
                  </span>
                  <input
                    id="fileAttachment"
                    type="file"
                    name="fileAttachment"
                    className="hidden"
                    disabled
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                    }}
                    // value={}
                  />
                </label>

                {selfForm.attachments && selfForm.attachments.length > 0 ? (
                  <div className="mt-2 text-xs">
                    📎{" "}
                    <a
                      href={selfForm.attachments[0].filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 underline hover:text-indigo-900"
                    >
                      {selfForm.attachments[0].fileName}
                    </a>
                  </div>
                ) : (
                  file && (
                    <div className="mt-1 w-full rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-300">
                      📎 <strong>Selected:</strong> {file.name}
                    </div>
                  )
                )}
              </div>
              <div className="flex-1 flex flex-col space-y-2 mb-6">
                <Label
                  name="Remarks"
                  htmlFor="remarks"
                  className="block text-sm font-medium text-gray-900"
                />
                <TextArea
                  id="remarks"
                  name="remarks"
                  value={selfForm.formData.remarks}
                  onChange={handleTextAreaChange}
                  placeholder="Remarks"
                  disabled
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
