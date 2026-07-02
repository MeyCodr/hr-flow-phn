"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/app/component/ui/Input";
import { TextArea } from "@/app/component/ui/TextArea";
import Label from "@/app/component/ui/Label";
import CheckBox from "@/app/component/ui/CheckBox";
import ComboBox from "@/app/component/ui/ComboBox";
import DateTimePicker from "@/app/component/ui/DateTimePicker";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import LoadingScreen from "@/app/component/ui/LoadingScreen";
import {
  Department,
  Division,
  Section,
  SexualHarassmentReportTypes,
  User,
  UserInfo,
} from "@/app/types/types";
import { withBasePath } from "@/lib/base-path";
import {
  workLocation as workLocationOptions,
  reportAsOptions,
  evidenceTypeOptions,
} from "@/lib/data";

const inputClassName =
  "w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClassName = "block text-xs font-medium text-gray-900";

interface SexualHarassmentReportFormProps {
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>;
  user?: User | null;
}

const initialData: SexualHarassmentReportTypes = {
  reporterName: "",
  reporterContact: "",
  reporterEmail: "",
  isStaff: true,
  staffId: "",
  workLocation: "",
  division: "",
  department: "",
  section: "",
  reportAs: "",
  perpetratorName: "",
  victimName: "",
  incidentLocation: "",
  incidentDateTime: "",
  description: "",
  witnessName: "",
  evidenceType: "",
  supportEvidence: null,
  declaration: false,
  website: "",
};

export default function SexualHarassmentReportForm({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  user,
}: SexualHarassmentReportFormProps) {
  const router = useRouter();
  const [data, setData] = useState<SexualHarassmentReportTypes>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.staffid) return;

    const prefillFromProfile = async () => {
      try {
        const res = await axios.get(withBasePath(`/api/user/${user.staffid}`));
        const info = res.data.data as UserInfo;

        setData((prev) => ({
          ...prev,
          reporterName: prev.reporterName || info.fullname || "",
          reporterEmail: prev.reporterEmail || user.email || "",
          staffId: prev.staffId || info.staffid || "",
          workLocation: prev.workLocation || info.workLocation || "",
          division:
            prev.division ||
            (info.divisionId ? info.divisionId.toString() : ""),
          department:
            prev.department ||
            (info.departmentId ? info.departmentId.toString() : ""),
          section:
            prev.section || (info.sectionId ? info.sectionId.toString() : ""),
        }));

        if (info.divisionId) setSelectedDivision(info.divisionId.toString());
        if (info.departmentId)
          setSelectedDepartment(info.departmentId.toString());
      } catch (error) {
        console.error("Failed to prefill from user profile:", error);
      }
    };

    prefillFromProfile();
  }, [user?.staffid, user?.email, setSelectedDivision, setSelectedDepartment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!data.reporterName.trim()) return "Please provide your full name.";
    if (!data.reporterContact.trim())
      return "Please provide a contact number or email.";
    if (!data.reporterEmail?.trim())
      return "Please provide your email address.";
    if (!data.staffId?.trim()) return "Please provide your staff ID.";
    if (!data.workLocation) return "Please select your work location.";
    if (!data.division) return "Please select your division.";
    if (!data.department) return "Please select your department.";
    if (!data.section) return "Please select your section.";
    if (!data.reportAs)
      return "Please indicate whether you are the victim or a witness.";
    if (!data.perpetratorName.trim())
      return "Please provide the perpetrator's name.";
    if (!data.victimName.trim()) return "Please provide the victim's name.";
    if (!data.incidentLocation.trim())
      return "Please provide the location where the incident occurred.";
    if (!data.incidentDateTime.trim())
      return "Please provide the date and time of the incident.";
    if (!data.description.trim()) return "Please describe what happened.";
    if (!data.evidenceType)
      return "Please indicate whether you have any supporting evidence.";
    if (!data.declaration)
      return "Please confirm the declaration before submitting.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formData = new FormData();
    if (data.supportEvidence) {
      formData.append("fileAttachment", data.supportEvidence);
    }
    formData.append("data", JSON.stringify({ ...data, supportEvidence: null }));

    setLoading(true);
    try {
      await axios.post(
        withBasePath("/api/public/sexual-harassment-report"),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      router.push("/report/sexual-harassment/submitted");
    } catch (error) {
      let errorMessage = "Submission failed. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error || error.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <LoadingScreen show={loading} />

      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-3xl rounded-xl p-6 border border-gray-300"
      >
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Sexual Harassment Report</h1>
          <p className="text-sm text-indigo-800">
            This form does not require you to log in. Your report will only be
            visible to our designated compliance officers, not your manager or
            any department head.
          </p>
        </div>

        {/* Honeypot field - hidden from real users, bots tend to fill every field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.website}
            onChange={handleChange}
          />
        </div>

        <h2 className="font-semibold text-sm mb-4">Your details</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-2">
            <Label
              name="Full Name"
              htmlFor="reporterName"
              className={labelClassName}
            />
            <Input
              id="reporterName"
              name="reporterName"
              type="text"
              value={data.reporterName}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Contact Number"
              htmlFor="reporterContact"
              className={labelClassName}
            />
            <Input
              id="reporterContact"
              name="reporterContact"
              type="text"
              value={data.reporterContact}
              onChange={handleChange}
              placeholder="Phone number"
              required
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Email"
              htmlFor="reporterEmail"
              className={labelClassName}
            />
            <Input
              id="reporterEmail"
              name="reporterEmail"
              type="email"
              value={data.reporterEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Staff ID"
              htmlFor="staffId"
              className={labelClassName}
            />
            <Input
              id="staffId"
              name="staffId"
              type="text"
              value={data.staffId}
              onChange={handleChange}
              placeholder="Staff ID"
              required
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Work Location"
              htmlFor="workLocation"
              className={labelClassName}
            />
            <ComboBox
              menu={workLocationOptions}
              selectedValue={data.workLocation}
              onSelect={(item) => {
                setData((prev) => ({
                  ...prev,
                  workLocation: item ? item.name : "",
                }));
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Division"
              htmlFor="division"
              className={labelClassName}
            />
            <ComboBox
              menu={divisions}
              selectedValue={data.division}
              onSelect={(item) => {
                const value = item ? item.id.toString() : "";
                setSelectedDivision(value);
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
              className={labelClassName}
            />
            <ComboBox
              menu={departments}
              selectedValue={data.department}
              onSelect={(item) => {
                const value = item ? item.id.toString() : "";
                setSelectedDepartment(value);
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
              className={labelClassName}
            />
            <ComboBox
              menu={sections}
              selectedValue={data.section}
              onSelect={(item) => {
                const value = item ? item.id.toString() : "";
                setData((prev) => ({ ...prev, section: value }));
              }}
            />
          </div>
        </div>

        <h2 className="font-semibold text-sm mb-4">What happened</h2>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="Anda ingin membuat laporan sebagai? / You wish to lodge report as?"
            htmlFor="reportAs"
            className={labelClassName}
          />
          <div className="text-xs">
            {reportAsOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-4 mb-2 cursor-pointer"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    reportAs:
                      prev.reportAs === option.value ? "" : option.value,
                  }))
                }
              >
                <CheckBox
                  checked={data.reportAs === option.value}
                  onChange={(checked) =>
                    setData((prev) => ({
                      ...prev,
                      reportAs: checked ? option.value : "",
                    }))
                  }
                />
                <Label
                  name={option.label}
                  htmlFor={option.value}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <Label
          name="Sila jelaskan kejadian yang berlaku / Please explain the incident occured:"
          htmlFor="description"
          className={`${labelClassName} mb-4 block`}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-2">
            <Label
              name="a. Nama Pelaku (Perpetrator's name)"
              htmlFor="perpetratorName"
              className={labelClassName}
            />
            <Input
              id="perpetratorName"
              name="perpetratorName"
              type="text"
              value={data.perpetratorName}
              onChange={handleChange}
              placeholder="Name of the perpetrator"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="b. Nama Mangsa (Victim's name)"
              htmlFor="victimName"
              className={labelClassName}
            />
            <Input
              id="victimName"
              name="victimName"
              type="text"
              value={data.victimName}
              onChange={handleChange}
              placeholder="Name of the victim"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="c. Tempat Kejadian (Location)"
              htmlFor="incidentLocation"
              className={labelClassName}
            />
            <Input
              id="incidentLocation"
              name="incidentLocation"
              type="text"
              value={data.incidentLocation}
              onChange={handleChange}
              placeholder="Where did this happen?"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="d. Tarikh / Masa kejadian (Date / time)"
              htmlFor="incidentDateTime"
              className={labelClassName}
            />
            <DateTimePicker
              value={data.incidentDateTime || null}
              onChange={(val) => setData((prev) => ({ ...prev, incidentDateTime: val ?? "" }))}
              placeholder="Select date & time"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="e. Maklumat Kejadian (Incident details)"
            htmlFor="description"
            className={labelClassName}
          />
          <TextArea
            id="description"
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Please describe what happened, as best you can"
            rows={6}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="f. Nama saksi (jika ada) (Witness name, if any)"
            htmlFor="witnessName"
            className={labelClassName}
          />
          <Input
            id="witnessName"
            name="witnessName"
            type="text"
            value={data.witnessName}
            onChange={handleChange}
            placeholder="Optional"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="Adakah anda mempunyai bukti yang boleh menyokong kenyataan anda? / Do you have any evidence to support your statement?"
            htmlFor="evidenceType"
            className={labelClassName}
          />
          <div className="text-xs">
            {evidenceTypeOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-4 mb-2 cursor-pointer"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    evidenceType:
                      prev.evidenceType === option.value ? "" : option.value,
                  }))
                }
              >
                <CheckBox
                  checked={data.evidenceType === option.value}
                  onChange={(checked) =>
                    setData((prev) => ({
                      ...prev,
                      evidenceType: checked ? option.value : "",
                    }))
                  }
                />
                <Label
                  name={option.label}
                  htmlFor={option.value}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="Supporting evidence (optional)"
            htmlFor="supportEvidence"
            className={labelClassName}
          />
          <label
            htmlFor="supportEvidence"
            className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-xs bg-white border-gray-300 text-gray-600 hover:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition"
          >
            <span className="truncate">
              {data.supportEvidence
                ? data.supportEvidence.name
                : "Choose a file or drag & drop"}
            </span>
            <span className="ml-2 rounded px-3 py-1 text-xs font-medium text-white bg-indigo-800">
              Browse
            </span>
            <input
              id="supportEvidence"
              type="file"
              name="supportEvidence"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setData((prev) => ({ ...prev, supportEvidence: file }));
              }}
            />
          </label>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="I declare that the information provided is true to the best of my knowledge."
            htmlFor="declaration"
            className={labelClassName}
          />
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() =>
              setData((prev) => ({ ...prev, declaration: !prev.declaration }))
            }
          >
            <CheckBox
              checked={data.declaration}
              onChange={(checked) =>
                setData((prev) => ({ ...prev, declaration: checked }))
              }
            />
            <Label
              name="Yes, I declare this is true"
              htmlFor="declaration"
              className="cursor-pointer text-xs"
            />
          </div>
        </div>

        <PrimaryButton
          type="submit"
          name="Submit Report"
          className="px-4 py-2 text-xs rounded text-white bg-indigo-800 hover:bg-indigo-900 cursor-pointer"
        />
      </form>
    </>
  );
}
