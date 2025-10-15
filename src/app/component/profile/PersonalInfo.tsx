"use client"

import React, { SetStateAction } from "react";
import { Department, Division, Section, User } from "@/app/types/types";
import FormInfo from "./FormInfo";

export interface PersonalInfoType {
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: React.Dispatch<SetStateAction<string>>;
  setSelectedDepartment: React.Dispatch<SetStateAction<string>>;
  setSelectedSection: React.Dispatch<SetStateAction<string>>;
  setSelectedWorkLocation: React.Dispatch<SetStateAction<string>>;
  user: User | null;
}

export default function PersonalInfo({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setSelectedWorkLocation,
  user,
}: PersonalInfoType) {
  return (
    <div>
      <div>
        <h1 className="font-semibold text-xl">Personal Information</h1>
        <p className="text-indigo-800 text-sm font-light">
          Update your profile details
        </p>
      </div>

      <FormInfo
        divisions={divisions}
        departments={departments}
        sections={sections}
        setSelectedDivision={setSelectedDivision}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedSection={setSelectedSection}
        setSelectedWorkLocation={setSelectedWorkLocation}
        user={user}
      />
    </div>
  );
}
