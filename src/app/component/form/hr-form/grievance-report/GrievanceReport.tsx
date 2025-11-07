"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingScreen from "../../../ui/LoadingScreen";
import ProgressBar from "../../../ui/ProgressBar";
import { GrievanceReportTypes } from "@/app/types/types";
import { StepOneForm } from "./StepOneForm";
import { StepTwoForm } from "./StepTwoForm";
import { StepThreeForm } from "./StepThreeForm";
import { StepFourForm } from "./StepFourForm";
import { DynamicFormProps } from "../HrFormsClient";
import { useRouter } from "next/navigation";
import axios from "axios";
import ActionModal from "@/app/component/ui/ActionModal";

export default function GrievanceReport({
  user,
  onSubmitSuccess,
  formId,
}: DynamicFormProps) {
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GrievanceReportTypes>({
    fullname: "",
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
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    formData.append("data", JSON.stringify({...data, remarks}));

    setLoading(true);
    try {
      await axios.post(`/api/form`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Form submitted successfully!");
      router.replace("/dashboard/forms");
      onSubmitSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < totalSteps) {
      return setStep(step + 1);
    }
    setOpen(true);
  };

  const goBack = () => setStep(Math.max(step - 1, 1));

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>

      <LoadingScreen show={loading} />

      <form
        onSubmit={handleSubmit}
        className="bg-white mx-auto p-4 mt-6 rounded-xl min-h-[450px] border border-gray-300 flex flex-col"
      >
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Grievance Report</h1>
          <p className="text-sm text-indigo-800">
            Submit your grievance to our management.
          </p>
        </div>
        <ProgressBar currentStep={step} totalSteps={totalSteps} />

        <div className="flex-grow">
          {step === 1 && (
            <StepOneForm data={data} handleChange={handleChange} />
          )}
          {step === 2 && (
            <StepTwoForm
              data={data}
              handleChange={handleChange}
              handleChangeCheckbox={handleChangeCheckbox}
              handleTextAreaChange={handleTextAreaChange}
            />
          )}
          {step === 3 && (
            <StepThreeForm
              data={data}
              handleTextAreaChange={handleTextAreaChange}
            />
          )}
          {step === 4 && (
            <StepFourForm
              data={data}
              handleTextAreaChange={handleTextAreaChange}
              handleCheckboxBoolean={handleCheckboxBoolean}
              handleFileChange={handleFileChange}
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

          <button
            type="submit"
            className="px-4 py-2 text-xs bg-indigo-800 hover:bg-indigo-900 cursor-pointer text-white rounded"
          >
            {step === totalSteps ? "Submit" : "Next"}
          </button>
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
