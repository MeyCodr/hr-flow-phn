import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import ApprovalComponent from "@/app/component/approval/ApprovalComponent";

export default async function Approval() {
  const session = await getServerSession(authOptions);
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

  const approvalsWithLevels = pendingApprovals.map((approval) => {
    const allSteps = approval.submission.approvals;
    const totalLevel = allSteps.length;

    // Find the lowest stepOrder still pending — that’s the current active approver
    const activeApproval = allSteps.find((a) => a.status === "PENDING");
    const activeLevel = activeApproval ? activeApproval.stepOrder : totalLevel;

    return {
      ...approval,
      totalLevel,
      currentLevel: approval.stepOrder,
      activeLevel,
    };
  });

  console.log("approval: ", approvalsWithLevels);

  return (
    <div className="w-full font-poppins">
      <div>
        <h1 className="font-bold text-3xl">Approval</h1>
        <p className="text-indigo-800">
          Review and manage pending approval requests.
        </p>
      </div>

      <ApprovalComponent pendingApprovals={approvalsWithLevels} />
    </div>
  );
}
