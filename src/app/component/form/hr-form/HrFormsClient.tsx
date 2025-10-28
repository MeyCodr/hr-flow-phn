"use client";

import React, { useEffect, useState } from "react";
import Card from "@/app/component/ui/Card";
import { HrFormComponents } from "../../../../../lib/hrformcomponents";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import axios from "axios";
import { Department, Division, Section, User } from "@/app/types/types";
import { IoReturnDownBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  user: User | null;
  onSubmitSuccess?: () => void;
  formId: number | null;
}

export default function HrFormsClient({
  forms,
  selectedId,
  selectedName,
}: {
  forms: FormType[];
  selectedId: number | null;
  selectedName: string | null;
}) {
  const [selectedFormName, setSelectedFormName] = useState<string | null>(
    selectedName
  );
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [, setSelectedSection] = useState<string>("");
  const [, setSelectedWorkLocation] = useState<string>("");

  const [selectedFormId, setSelectedFormId] = useState<number | null>(
    selectedId
  );
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();
  const safeForms = forms ?? [];
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const user = session.user;
      setUser(user);
    }
  }, [session]);

  useEffect(() => {
    setSelectedFormId(selectedId);
    setSelectedFormName(selectedName);
  }, [selectedId, selectedName]);

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
    const sanitized = sanitizeName(form.name);

    // ✅ Immediately update state before navigation
    setSelectedFormName(sanitized);
    setSelectedFormId(form.id);

    // ✅ Use replace to avoid extra history entries (optional)
    router.replace(`/dashboard/forms?id=${form.id}&name=${sanitized}`);
  };

  const handleBackClick = () => {
    setSelectedFormName(null); // reset to show cards again
    setSelectedFormId(null);
    router.push(`/dashboard/forms`);
  };

  const DynamicFormComponent = selectedFormName
    ? HrFormComponents[selectedFormName]
    : null;

  // If a form is selected, only render the form with a back button
  if (DynamicFormComponent) {
    return (
      <div className="font-poppins w-full ">
        <PrimaryButton
          name="Back"
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-xs rounded-md font-medium text-gray-700
                    bg-white border border-gray-300 shadow-xs hover:bg-gray-100 
                    hover:shadow-md transition-all duration-200 active:scale-95 mb-6 cursor-pointer"
          onClick={handleBackClick}
          icon={<IoReturnDownBack className="w-5 h-5" />}
        />
        <DynamicFormComponent
          formId={selectedFormId}
          divisions={divisions}
          departments={departments}
          sections={sections}
          setSelectedDivision={setSelectedDivision}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedSection={setSelectedSection}
          setSelectedWorkLocation={setSelectedWorkLocation}
          user={user}
          onSubmitSuccess={() => setSelectedFormName(null)}
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
