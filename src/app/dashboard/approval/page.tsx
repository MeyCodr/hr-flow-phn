import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import ApprovalComponent from "@/app/component/approval/ApprovalComponent";
import { redirect } from "next/navigation";

export default async function Approval() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); //protected page
  }

  const staffid = session?.user?.staffid;

  if (!staffid) {
    return <p>User not logged in</p>;
  }

  const user = await prisma.user.findUnique({
    where: { staffid },
  });

  if (!user) {
    return <p>User not found</p>;
  }

  const pendingApprovals = await prisma.approval.findMany({
    where: {
      approverId: user.id,
      // status: "PENDING"
    },
    include: {
      submission: {
        include: {
          createdBy: true,
          formType: true,
          approvals: {
            orderBy: { stepOrder: "asc" },
          },
        },
      },
    },
    orderBy: {
      stepOrder: "asc",
    },
  });

  const approvalsWithLevels = pendingApprovals.map(
    (approval: (typeof pendingApprovals)[number]) => {
      const allSteps = approval.submission.approvals;
      const totalLevel = allSteps.length;

      const activeApproval = allSteps.find(
        (a: (typeof allSteps)[number]) => a.status === "PENDING"
      );
      const activeLevel = activeApproval
        ? activeApproval.stepOrder
        : totalLevel;

      // ✅ Normalize formData so it’s always an object
      const normalizedFormData =
        typeof approval.submission.formData === "string"
          ? JSON.parse(approval.submission.formData)
          : approval.submission.formData ?? null;

      return {
        ...approval,
        totalLevel,
        currentLevel: approval.stepOrder,
        activeLevel,
        submission: {
          ...approval.submission,
          formData: normalizedFormData, // ✅ fix type mismatch
        },
      };
    }
  );

  const selfFormsRaw = await prisma.formSubmission.findMany({
    where: {
      createdById: user.id,
    },
    include: {
      formType: true, // ✅ include related form type
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const selfForms = selfFormsRaw.map((form: typeof selfFormsRaw[number]) => ({
    ...form,
    formData:
      typeof form.formData === "string"
        ? JSON.parse(form.formData)
        : form.formData,
  }));

  return (
    <div className="w-full font-poppins">
      <div>
        <h1 className="font-bold text-3xl">Approval</h1>
        <p className="text-indigo-800">
          Review and manage pending approval requests.
        </p>
      </div>

      <ApprovalComponent
        pendingApprovals={approvalsWithLevels}
        selfForms={selfForms}
        user={user}
      />
    </div>
  );
}
