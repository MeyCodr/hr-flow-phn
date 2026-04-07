import AdminComponent from "@/app/component/admin/AdminComponent";
import React from "react";
import { prisma } from "../../../../lib/prisma";
import { FormType, SelfFormData } from "@/app/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { redirect } from "next/navigation";
import {
  Approval,
  FileAttachment,
  FormSubmission,
  User,
} from "@/generated/client";

type FormData = {
  division: string;
  department: string;
  section: string;
};

export default async function Admin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); //protected page
  }

  const userListing = await prisma.user.findMany({
    include: {
      division: true,
      department: true,
      section: true,
    },
  });

  const formType = await prisma.formType.findMany({
    include: {
      flowSteps: true,
    },
  });

  const approvalFlow = (
    await prisma.approvalFlowStep.findMany({
      include: {
        formType: true,
        division: true,
        department: true,
        section: true,
        approvalStepApprovers: {
          include: {
            user: true,
          },
        },
      },
    })
  ).map((step) => ({
    ...step,
    division: step.division ?? undefined,
    department: step.department ?? undefined,
    section: step.section ?? undefined,
  }));

  const formSubmission = await prisma.formSubmission.findMany({
    include: {
      attachments: true,
      createdBy: true,
      formType: true,
      approvals: {
        include: {
          approver: true,
        },
      },
    },
  });

  const divisions = await prisma.division.findMany();
  const departments = await prisma.department.findMany();
  const sections = await prisma.section.findMany();

  console.log("form submission: ", formSubmission);

  const enrichedSubmissions: SelfFormData[] = formSubmission.map(
    (
      sub: FormSubmission & {
        createdBy: User;
        attachments: FileAttachment[];
        approvals: Approval[];
        formType: FormType;
      },
    ) => {
      const parsedFormData: FormData =
        typeof sub.formData === "string"
          ? JSON.parse(sub.formData)
          : (sub.formData as FormData);

      const division = divisions.find(
        (d) => d.id === Number(parsedFormData?.division),
      );

      const department = departments.find(
        (d) => d.id === Number(parsedFormData?.department),
      );

      const section = sections.find(
        (s) => s.id === Number(parsedFormData?.section),
      );

      return {
        ...sub,
        formType: sub.formType,
        formData: parsedFormData,
        attachments: sub.attachments.map((att) => ({
          ...att,
          fileType: att.fileType ?? "",
        })),
        approvals: sub.approvals.map((a) => ({
          ...a,
          currentLevel: a.stepOrder,
          totalLevel: sub.approvals.length,
          activeLevel: a.status === "PENDING" ? 1 : 0,
        })),
        departmentName: department?.name ?? "",
        divisionName: division?.name ?? "",
        sectionName: section?.name ?? "",
      };
    },
  );

  console.log("enrinched submission: ", enrichedSubmissions);

  return (
    <div className="w-full font-poppins">
      <div>
        <h1 className="font-bold text-3xl">Admin</h1>
        <p className="text-indigo-800">Manage admin site and approver level</p>
      </div>

      <AdminComponent
        formSubmission={enrichedSubmissions}
        userListing={userListing}
        formType={formType}
        approvalStep={approvalFlow}
      />
    </div>
  );
}

