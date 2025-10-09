"use client";

import React, { useEffect, useState } from "react";
import Card from "@/app/component/ui/Card";
import { HrFormComponents } from "../../../../../lib/hrformcomponents";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import axios from "axios";
import { Department, Division, Section } from "@/app/types/types";

interface FlowStep {
  id: number;
  formTypeId: number;
  order: number;
  role: string;
  departmentId: number | null;
  divisionId: number | null;
  sectionId: number | null;
  createdAt: Date; // allow Date
}

interface FormType {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date; // allow Date
  flowSteps: FlowStep[];
}

export interface DynamicFormProps {
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSection: React.Dispatch<React.SetStateAction<string>>;
  setSelectedWorkLocation: React.Dispatch<React.SetStateAction<string>>;
}

export default function HrFormsClient({ forms }: { forms: FormType[] }) {
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedWorkLocation, setSelectedWorkLocation] = useState<string>("");
  const safeForms = forms ?? [];

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

  const handleCardClick = (form: FormType) => {
    setSelectedFormName(sanitizeName(form.name));
  };

  const handleBackClick = () => {
    setSelectedFormName(null); // reset to show cards again
  };

  const DynamicFormComponent = selectedFormName
    ? HrFormComponents[selectedFormName]
    : null;

  // If a form is selected, only render the form with a back button
  if (DynamicFormComponent) {
    return (
      <div className="font-poppins w-full">
        <PrimaryButton
          name="Back"
          type="button"
          className="mb-6"
          onClick={handleBackClick}
        />
        <DynamicFormComponent
          divisions={divisions}
          departments={departments}
          sections={sections}
          setSelectedDivision={setSelectedDivision}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedSection={setSelectedSection}
          setSelectedWorkLocation={setSelectedWorkLocation}
        />
      </div>
    );
  }

  // Otherwise, render the list of cards
  return (
    <div className="font-poppins w-full">
      <div>
        <h1 className="font-bold text-3xl">HR Forms</h1>
        <p className="text-indigo-800">Select a form to submit your request</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        {safeForms.map((item) => (
          <Card
            key={item.id}
            formId={item.id}
            title={item.name}
            description={item.description ?? ""}
            approvals={item.flowSteps.length}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}
