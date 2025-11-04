"use client";

import React, { useEffect, useState } from "react";
import { RegisterForm, RegisterUser } from "../component/form/RegisterForm";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import LoadingScreen from "../component/ui/LoadingScreen";
import { Department, Division, Section } from "../types/types";

export default function Register() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [, setSelectedSection] = useState<string>("");
  const [, setSelectedWorkLocation] = useState<string>("");

  useEffect(() => {
    if (!session) {
      return;
    }
    setLoading(true);
    router.push("/");
  }, [session, router]);

  useEffect(() => {
    axios
      .get("/api/division")
      .then((res) => {
        setDivisions(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision && selectedDivision !== "0") {
      axios
        .get(`/api/department?divisionId=${selectedDivision}`)
        .then((res) => {
          setDepartments(res.data);
          setSections([]); // clear sections
        })
        .catch(console.error);
    } else {
      setDepartments([]);
      setSections([]);
    }

    setSelectedDepartment("0");
    setSelectedSection("0");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment && selectedDepartment !== "0") {
      axios
        .get(`/api/section?departmentId=${selectedDepartment}`)
        .then((res) => setSections(res.data))
        .catch(console.error);
    } else {
      setSections([]);
    }

    setSelectedSection("0");
  }, [selectedDepartment]);
  const handleSubmit = async (values: RegisterUser) => {
    console.log("values: ", values);

    const toastId = toast.loading("Creating account . . .");
    setLoading(true);

    try {
      const response = await axios.post(`/api/user`, values);
      console.log("response: ", response);
      if (response.status === 201) {
        toast.success("Account created!", { id: toastId });

        const loginResult = await signIn("credentials", {
          redirect: false,
          staffid: values.staffid,
          password: values.password,
        });

        if (loginResult?.error) {
          toast.error("Failed to login!", { id: toastId });
          router.push(`/login`);
        } else {
          router.push(`/`);
        }
      }
    } catch (error: unknown) {
      console.error(error);

      let errorMessage = "Failed to create account!";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 min-h-screen w-full">
      <div className="text-xs">
        <Toaster position="top-center" />
      </div>
      <RegisterForm
        onRegister={handleSubmit}
        divisions={divisions}
        departments={departments}
        sections={sections}
        setSelectedDivision={setSelectedDivision}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedSection={setSelectedSection}
        setSelectedWorkLocation={setSelectedWorkLocation}
      />
      <LoadingScreen show={loading} />
    </div>
  );
}
