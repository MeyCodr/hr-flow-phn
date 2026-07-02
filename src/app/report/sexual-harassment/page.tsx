"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import SexualHarassmentReportForm from "@/app/component/form/sexual-harassment-report/SexualHarassmentReportForm";
import { Department, Division, Section } from "@/app/types/types";
import { withBasePath } from "@/lib/base-path";

export default function SexualHarassmentReportPage() {
  // This page never requires a session, but if someone happens to already be
  // logged in (e.g. a staff member opening the public link directly), prefill
  // their known details for convenience.
  const { data: session } = useSession();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    axios
      .get(withBasePath("/api/division"))
      .then((res) => setDivisions(res.data))
      .catch((err) => console.error("Failed to fetch divisions:", err));
  }, []);

  useEffect(() => {
    if (selectedDivision && selectedDivision !== "0") {
      axios
        .get(withBasePath(`/api/department?divisionId=${selectedDivision}`))
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error("Failed to fetch departments:", err));
    } else {
      setDepartments([]);
    }
    setSections([]);
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment && selectedDepartment !== "0") {
      axios
        .get(withBasePath(`/api/section?departmentId=${selectedDepartment}`))
        .then((res) => setSections(res.data))
        .catch((err) => console.error("Failed to fetch sections:", err));
    } else {
      setSections([]);
    }
  }, [selectedDepartment]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <SexualHarassmentReportForm
        divisions={divisions}
        departments={departments}
        sections={sections}
        setSelectedDivision={setSelectedDivision}
        setSelectedDepartment={setSelectedDepartment}
        user={session?.user}
      />
    </div>
  );
}
