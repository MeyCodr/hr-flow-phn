import AdminComponent from "@/app/component/admin/AdminComponent";
import React from "react";
import { prisma } from "../../../../lib/prisma";

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
      flowSteps:true,
    }
  });

  const approvalFlow = await prisma.approvalFlowStep.findMany();


  console.log("approval flow: ", approvalFlow);
  console.log("form type: ", formType);
  console.log("suer listing: ", userListing);

  return (
    <div className="w-full font-poppins">
      <div>
        <h1 className="font-bold text-3xl">Admin</h1>
        <p className="text-indigo-800">Manage admin site and approver level</p>
      </div>

      <AdminComponent userListing={userListing} formType={formType} approvalStep={approvalFlow}/>
    </div>
  );
}
