"use client";

import React, { useEffect, useState } from "react";
import Tabs, { TabItem } from "../ui/Tabs";
import UserListing from "./UserListing";
import { Department, Division, Section, UserType } from "@/app/types/types";
import axios from "axios";

interface AdminComponentProps {
  userListing: UserType[];
}

export default function AdminComponent({ userListing }: AdminComponentProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  // state for selection (for filtering)
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  

  useEffect(() => {
    axios
      .get("/api/division")
      .then((res) => setDivisions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      axios
        .get(`/api/department?divisionId=${selectedDivision}`)
        .then((res) => setDepartments(res.data))
        .catch(console.error);
    } else {
      setDepartments([]);
      setSections([]);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(`/api/section?departmentId=${selectedDepartment}`)
        .then((res) => setSections(res.data))
        .catch(console.error);
    } else {
      setSections([]);
    }
  }, [selectedDepartment]);

  const categories: TabItem[] = [
    { name: "Approval Flow", content: <p>here</p> },
    {
      name: "User Listing",
      content: (
        <UserListing
          userListing={userListing}
          divisions={divisions}
          departments={departments}
          sections={sections}
          setSelectedDivision={setSelectedDivision}
          setSelectedDepartment={setSelectedDepartment}
        />
      ),
    },
    { name: "Form Create", content: <p>History goes here</p> },
  ];
  return (
    <div className="my-6">
      <Tabs tabs={categories} />
    </div>
  );
}
