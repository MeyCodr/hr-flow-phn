import AdminComponent from "@/app/component/admin/AdminComponent";
import React from "react";
import { prisma } from "../../../../lib/prisma";
import { SelfFormData } from "@/app/types/types";

export default async function Admin() {
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

  const approvalFlow = await prisma.approvalFlowStep.findMany({
    include: {
      formType: true,
      division: true,
      department: true,
      section: true,
    },
  });

  const formSubmission = await prisma.formSubmission.findMany({
    include: {
      attachments: true,
      createdBy: true,
      formType: true,
      approvals: true,
    },
  });

  const divisions = await prisma.division.findMany();
  const departments = await prisma.department.findMany();
  const sections = await prisma.section.findMany();

  const enrichedSubmissions: SelfFormData[] = formSubmission.map((sub) => {
    const department = departments.find(
      (d) => d.id === sub.createdBy.departmentId
    );
    const division = divisions.find((d) => d.id === sub.createdBy.divisionId);
    const section = sections.find((s) => s.id === sub.createdBy.sectionId);

    return {
      ...sub,
      formData:
        typeof sub.formData === "string"
          ? JSON.parse(sub.formData)
          : sub.formData,
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
  });

  console.log("approval flow: ", approvalFlow);
  console.log("form type: ", formType);
  console.log("suer listing: ", userListing);
  console.log("form submission: ", formSubmission);

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
