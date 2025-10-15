"use client";

import { useEffect, useState } from "react";
import ActivityStats from "./ActivityStats";
import PersonalInfo from "./PersonalInfo";
import { Department, Division, Section, User } from "@/app/types/types";
import axios from "axios";
import { useSession } from "next-auth/react";
import DisplayProfile from "./DisplayProfile";

export interface UserProfile {
  id: number;
  fullname: string;
  staffid: string;
  email: string;
  divisionId: number | null;
  departmentId: number | null;
  sectionId: number | null;
  designation: string | null; // 👈 can be null in DB
  workLocation: string | null; // 👈 can be null
  role: string | null; // 👈 can be null
  password: string;
  createdAt: Date;
  updatedAt: Date;
  division: Division | null;
  department: Department | null;
  section: Section | null;
}

export interface ProfileComponentProps {
  userProfile?: UserProfile;
  stats?: {
    label: string;
    value: number;
    color?: string;
  }[];
}

export default function ProfileComponent({
  userProfile,
  stats,
}: ProfileComponentProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [, setSelectedSection] = useState<string>("");
  const [, setSelectedWorkLocation] = useState<string>("");

  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User);
    }
  }, [session]);

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
        .then((res) => {
          setDepartments(res.data);
          setSections([]);
        })
        .catch(console.error);
    } else {
      setDepartments([]);
      setSections([]);
    }
    setSelectedDepartment("");
    setSelectedSection("");
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
    setSelectedSection("");
  }, [selectedDepartment]);

  return (
    <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_2fr] gap-6 my-6">
      {/* LEFT COLUMN */}
      <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-xs">
        <DisplayProfile userProfile={userProfile} />
      </div>

      {/* RIGHT COLUMN */}
      <div className="grid gap-6">
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-xs">
          <ActivityStats stats={stats} />
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-xs">
          <PersonalInfo
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
      </div>
    </div>
  );
}
