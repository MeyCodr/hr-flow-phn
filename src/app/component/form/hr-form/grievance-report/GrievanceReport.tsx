"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingScreen from "../../../ui/LoadingScreen";
import ProgressBar from "../../../ui/ProgressBar";
import { GrievanceReportTypes, UserInfo } from "@/app/types/types";
import { StepOneForm } from "./StepOneForm";
import { StepTwoForm } from "./StepTwoForm";
import { StepThreeForm } from "./StepThreeForm";
import { StepFourForm } from "./StepFourForm";
import { DynamicFormProps } from "../HrFormsClient";
import { useRouter } from "next/navigation";
import axios from "axios";
import ActionModal from "@/app/component/ui/ActionModal";

export default function GrievanceReport({
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
}: DynamicFormProps & { readOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GrievanceReportTypes>({
    fullname: "",
    division: "",
    section: "",
    department: "",
    contactNo: "",
    staffId: "",
    designation: "",
    dateOfComplaint: "",
    complaintTypes: "",
    others: "",
    detailComplaints: "",
    attemptsResolve: "",
    preferredOutcome: "",
    supportEvidence: null,
    declaration: false,
    remarks: "",
  });
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  console.log("deaprtmetns here: ", departments);

  useEffect(() => {
    if (!user) {
      return;
    }
    const staffid = user.staffid;
    console.log("staffid admin here: ", staffid);

    if (!staffid) {
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/user/${staffid}`);
        console.log("res: ", res.data.data);
        const userInfo = res.data.data;
        setData((prev) => ({
          ...prev,
          designation: userInfo.designation,
        }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setData((prev) => ({
      ...prev,
      complaintTypes: value,
      // auto reset "others" if switching away from Other
      others: value === "Other" ? prev.others : "",
    }));
  };

  const handleCheckboxBoolean = (
    name: keyof GrievanceReportTypes,
    value: boolean
  ) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setData((prev) => ({ ...prev, supportEvidence: file }));
  };

  const submitGrievance = async (remarks: string) => {
    if (!formId) return;
    console.log("data: ", data);
    const formData = new FormData();
    formData.append("user", JSON.stringify(user));
    formData.append("formId", formId.toString());
    if (data.supportEvidence) {
      formData.append("fileAttachment", data.supportEvidence);
    }
    formData.append("data", JSON.stringify({ ...data, remarks }));

    setLoading(true);
    try {
      await axios.post(`/api/form/grievance-post`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Form submitted successfully!");
      setTimeout(() => {
        router.replace("/dashboard/forms");
        onSubmitSuccess?.();
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!readOnly) {
      if (!validateStep()) {
        toast.error("Please fill in all required fields before proceeding.");
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setOpen(true);
    }
  };

  const goBack = () => setStep(Math.max(step - 1, 1));

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return (
          !!data.fullname &&
          !!data.division &&
          !!data.department &&
          !!data.section &&
          !!data.contactNo &&
          !!data.staffId &&
          !!data.designation
        );

      case 2:
        return (
          !!data.complaintTypes &&
          (data.complaintTypes !== "Other" || !!data.others) &&
          !!data.detailComplaints
        );

      case 3:
        return !!data.attemptsResolve && !!data.preferredOutcome;

      case 4:
        return data.declaration === true; // must check the declaration box

      default:
        return true;
    }
  };

  console.log("self form data here: ", selfForm);
  // const parsedData = selfForm?.formData as unknown as GrievanceReportTypes;

  const parsedData: GrievanceReportTypes = {
    ...(selfForm?.formData as unknown as GrievanceReportTypes),
    divisionName: selfForm?.divisionName,
    departmentName: selfForm?.departmentName,
    sectionName: selfForm?.sectionName,
  };

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>

      <LoadingScreen show={loading} />

      <form
        onSubmit={handleSubmit}
        className={`bg-white max-w-6xl rounded-xl ${
          readOnly ? "p-0" : "p-4 border border-gray-300 "
        }`}
      >
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {readOnly ? "" : "Grievance Report"}
          </h1>
          <p className="text-sm text-indigo-800">
            {readOnly ? "" : "Submit your grievance to our management."}
          </p>
        </div>

        {readOnly ? (
          ""
        ) : (
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        )}

        <div className="flex-grow">
          {step === 1 && (
            <StepOneForm
              data={data}
              handleChange={handleChange}
              divisions={divisions}
              departments={departments}
              sections={sections}
              setSelectedDivision={setSelectedDivision}
              setSelectedDepartment={setSelectedDepartment}
              setSelectedSection={setSelectedSection}
              setData={setData}
              userInfo={userInfo}
              readOnly={readOnly}
              parsedData={parsedData}
            />
          )}
          {step === 2 && (
            <StepTwoForm
              data={data}
              handleChange={handleChange}
              handleChangeCheckbox={handleChangeCheckbox}
              handleTextAreaChange={handleTextAreaChange}
              readOnly={readOnly}
              parsedData={parsedData}
            />
          )}
          {step === 3 && (
            <StepThreeForm
              data={data}
              handleTextAreaChange={handleTextAreaChange}
              readOnly={readOnly}
              parsedData={parsedData}
            />
          )}
          {step === 4 && (
            <StepFourForm
              data={data}
              handleTextAreaChange={handleTextAreaChange}
              handleCheckboxBoolean={handleCheckboxBoolean}
              handleFileChange={handleFileChange}
              readOnly={readOnly}
              selfForm={selfForm}
            />
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 text-xs bg-gray-600 hover:bg-gray-800 text-white rounded cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === totalSteps ? (
            !readOnly ? (
              <button
                type="submit"
                disabled={readOnly && step === totalSteps} // ✅ disable only on Submit step
                className={`px-4 py-2 text-xs rounded text-white  ${
                  readOnly && step === totalSteps
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-800 hover:bg-indigo-900 cursor-pointer"
                }`}
              >
                Submit
              </button>
            ) : (
              <></>
            )
          ) : (
            <button
              type="submit"
              disabled={readOnly && step === totalSteps} // ✅ disable only on Submit step
              className={`px-4 py-2 text-xs rounded text-white flex justify-end  ${
                readOnly && step === totalSteps
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-800 hover:bg-indigo-900 cursor-pointer"
              }`}
            >
              Next
            </button>
          )}
        </div>
      </form>

      <ActionModal
        isOpen={open}
        onCancel={() => setOpen(false)}
        title="Confirm Submission"
        message=""
        onConfirm={(value) => {
          setOpen(false);
          setData((prev) => ({ ...prev, remarks: value }));
          submitGrievance(value);
        }}
        inputPlaceholder="Fill remarks here"
      />
    </>
  );
}
